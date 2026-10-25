import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";

type Theme = "light" | "dark";
type Motion = "full" | "paused";

const THEME_KEY = "je-theme";
const MOTION_KEY = "je-motion";

function read(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; }
}
function write(key: string, v: string) {
  try { window.localStorage.setItem(key, v); } catch { /* storage unavailable: preference lasts for this visit only */ }
}
function mq(q: string): MediaQueryList | null {
  try { return typeof window.matchMedia === "function" ? window.matchMedia(q) : null; } catch { return null; }
}

function initialTheme(): Theme {
  const root = document.documentElement;
  const attr = root.dataset.theme;
  if (attr === "light" || attr === "dark") return attr;
  const s = read(THEME_KEY);
  if (s === "light" || s === "dark") return s;
  return mq("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
}
function initialMotion(): Motion {
  // Keep user intent separate from the bootstrap's effective OS-reduced state.
  return read(MOTION_KEY) === "paused" ? "paused" : "full";
}

function explicitTheme(): Theme | null {
  const saved = read(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  const preview = new URLSearchParams(window.location.search).get("theme");
  return preview === "light" || preview === "dark" ? preview : null;
}

function applyTheme(t: Theme) {
  const r = document.documentElement;
  r.classList.toggle("dark", t === "dark");
  r.dataset.theme = t;
  r.style.colorScheme = t;
}

type Ctx = {
  theme: Theme;
  toggleTheme: () => void;
  motion: Motion;
  systemReduced: boolean;
  /** true when decorative motion should not run (user pause OR OS preference) */
  still: boolean;
  toggleMotion: () => void;
};
const PrefsCtx = createContext<Ctx | null>(null);

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const themeOverride = useRef<Theme | null>(explicitTheme());
  const [motion, setMotion] = useState<Motion>(initialMotion);
  const [systemReduced, setSystemReduced] = useState(() => !!mq("(prefers-reduced-motion: reduce)")?.matches);

  useEffect(() => { applyTheme(theme); }, [theme]);
  useEffect(() => {
    document.documentElement.dataset.motion = systemReduced || motion === "paused" ? "paused" : "full";
  }, [motion, systemReduced]);

  // Follow the OS theme only while the visitor has not chosen one.
  useEffect(() => {
    const m = mq("(prefers-color-scheme: dark)");
    if (!m) return;
    const on = (e: MediaQueryListEvent) => { if (!themeOverride.current) setTheme(e.matches ? "dark" : "light"); };
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  useEffect(() => {
    const m = mq("(prefers-reduced-motion: reduce)");
    if (!m) return;
    const on = (e: MediaQueryListEvent) => setSystemReduced(e.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  // Pause every decorative loop while the tab is hidden.
  useEffect(() => {
    const on = () => { document.documentElement.dataset.hidden = document.hidden ? "true" : "false"; };
    on();
    document.addEventListener("visibilitychange", on);
    return () => document.removeEventListener("visibilitychange", on);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    themeOverride.current = next;
    write(THEME_KEY, next);
    setTheme(next);
  }, [theme]);
  const toggleMotion = useCallback(() => setMotion((m) => { const n = m === "paused" ? "full" : "paused"; write(MOTION_KEY, n); return n; }), []);

  const value = useMemo(() => ({ theme, toggleTheme, motion, systemReduced, still: systemReduced || motion === "paused", toggleMotion }),
    [theme, toggleTheme, motion, systemReduced, toggleMotion]);
  return <PrefsCtx.Provider value={value}>{children}</PrefsCtx.Provider>;
}

export function usePrefs() {
  const c = useContext(PrefsCtx);
  if (!c) throw new Error("usePrefs outside PrefsProvider");
  return c;
}

/* ---------- One shared IntersectionObserver for reveals + offscreen pausing ---------- */
type Cb = (visible: boolean) => void;
const callbacks = new WeakMap<Element, Cb>();
let shared: IntersectionObserver | null = null;
function getObserver(): IntersectionObserver | null {
  if (shared) return shared;
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return null;
  try {
    shared = new IntersectionObserver((entries) => {
      for (const e of entries) callbacks.get(e.target)?.(e.isIntersecting);
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
  } catch {
    return null;
  }
  return shared;
}
export function observe(el: Element, cb: Cb): () => void {
  const io = getObserver();
  if (!io) { cb(true); return () => {}; }
  callbacks.set(el, cb);
  io.observe(el);
  return () => { io.unobserve(el); callbacks.delete(el); };
}

/** Marks an element data-active="true|false" so CSS can pause its loops offscreen. */
export function useActiveWhileVisible(ref: RefObject<HTMLElement | SVGSVGElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.setAttribute("data-active", "false");
    return observe(el, (v) => el.setAttribute("data-active", v ? "true" : "false"));
  }, [ref]);
}

/** Enable reveal-hiding only once JS and an observer exist; otherwise content simply shows. */
export function useRevealEnabled() {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    if (getObserver()) document.documentElement.classList.add("js-reveal");
  }, []);
}
