import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, ArrowUpRight, Download, Menu, Moon, Sun, X } from "lucide-react";
import { CONTACT, RESUME } from "@/data";
import { observe, useActiveWhileVisible, usePrefs } from "@/components/prefs";

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let stop = () => {};
    stop = observe(el, (v) => { if (v) { el.classList.add("in"); stop(); } });
    return () => stop();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>{children}</div>;
}

/** Cheap ambient field: a dot lattice plus two slow, unblurred radial washes. Paused offscreen. */
export function Ambient({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useActiveWhileVisible(ref);
  return (
    <div ref={ref} className={`ambient ${className}`} aria-hidden>
      <span className="w1" /><span className="w2" />
    </div>
  );
}

type HBProps = { children: ReactNode; href: string; external?: boolean; download?: boolean; variant?: "solid" | "line"; icon?: "arrow" | "out" | "down"; testId: string };
export function HoverButton({ children, href, external, download, variant = "solid", icon = "arrow", testId }: HBProps) {
  const Icon = icon === "down" ? Download : icon === "out" ? ArrowUpRight : ArrowRight;
  const base = variant === "solid"
    ? "bg-foreground text-background border-foreground"
    : "bg-transparent text-foreground border-foreground/30";
  const inner = (
    <>
      <span className="absolute left-4 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-accent transition-transform duration-500 ease-out group-hover:scale-[60] group-focus-visible:scale-[60]" aria-hidden />
      <span className="relative z-10 inline-block transition-[transform,opacity] duration-300 group-hover:translate-x-10 group-hover:opacity-0 group-focus-visible:translate-x-10 group-focus-visible:opacity-0">{children}</span>
      <span className="absolute inset-0 z-10 flex translate-x-10 items-center justify-center gap-2 text-accent-foreground opacity-0 transition-[transform,opacity] duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100" aria-hidden>
        {children}<Icon className="h-4 w-4" />
      </span>
    </>
  );
  const cls = `hover-button group relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-full border pl-9 pr-6 py-3 font-mono text-[13px] uppercase tracking-wider active:scale-[.97] transition-transform ${base}`;
  if (external || download) {
    return <a data-testid={testId} href={href} className={cls} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...(download ? { download: "Je-Sai-Kailash-Pulipati-Resume.pdf" } : {})}>{inner}</a>;
  }
  return <Link data-testid={testId} href={href} className={cls}>{inner}</Link>;
}

const NAV = [
  { label: "Story", href: "/#story" },
  { label: "Workshop", href: "/#workshop" },
  { label: "Connections", href: "/#connections" },
  { label: "Work", href: "/work" },
  { label: "Research", href: "/#research" },
  { label: "Contact", href: "/#contact" },
];

export function ThemeButton({ testId }: { testId: string }) {
  const { theme, toggleTheme } = usePrefs();
  const dark = theme === "dark";
  return (
    <button type="button" onClick={toggleTheme} data-testid={testId} aria-pressed={dark} aria-label={dark ? "Dark theme on. Switch to light theme" : "Light theme on. Switch to dark theme"}
      title={dark ? "Switch to light" : "Switch to dark"}
      className="grid h-11 w-11 place-items-center rounded-full border border-foreground/20 transition-colors hover:border-foreground">
      {dark ? <Sun className="h-[18px] w-[18px]" aria-hidden /> : <Moon className="h-[18px] w-[18px]" aria-hidden />}
    </button>
  );
}

export function MotionButton({ testId }: { testId: string; withLabel?: boolean }) {
  const { motion, systemReduced, toggleMotion } = usePrefs();
  const paused = systemReduced || motion === "paused";
  const label = systemReduced ? "Decorative animations off: your device requests reduced motion" : "Decorative animations";
  return (
    <button type="button" role="switch" aria-checked={!paused} onClick={toggleMotion} disabled={systemReduced}
      data-testid={testId} aria-label={label} title={systemReduced ? label : "Turns decorative motion on or off across the site. Interactive controls still work."}
      className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2.5 rounded-full border border-foreground/20 px-3 font-mono text-[10px] uppercase tracking-wider transition-colors hover:border-foreground disabled:cursor-not-allowed disabled:opacity-70">
      <span>Animations {systemReduced ? "off · system" : paused ? "off" : "on"}</span>
      <span className={`relative h-5 w-8 rounded-full ${paused ? "bg-foreground/25" : "bg-primary"}`} aria-hidden>
        <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-background transition-transform ${paused ? "" : "translate-x-3"}`} />
      </span>
    </button>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const [loc] = useLocation();
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => setOpen(false), [loc]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); btn.current?.focus(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-5 md:px-8">
        <Link href="/" data-testid="link-home" className="flex min-h-11 items-center gap-3" aria-label="Je Kailash, home">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary font-mono text-xs text-primary-foreground" aria-hidden>JK</span>
          <span className="font-display text-lg font-bold">Je Kailash</span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
          {NAV.map((n) => (
            <Link key={n.label} href={n.href} data-testid={`link-nav-${n.label.toLowerCase()}`} className="inline-flex min-h-11 items-center font-mono text-xs uppercase tracking-widest text-foreground/75 transition-colors hover:text-primary">{n.label}</Link>
          ))}
          <a href={RESUME} download="Je-Sai-Kailash-Pulipati-Resume.pdf" data-testid="link-nav-resume" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-foreground/25 px-4 font-mono text-xs uppercase tracking-widest transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground">
            Résumé <Download className="h-3.5 w-3.5" aria-hidden />
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeButton testId="button-theme" />
          <button ref={btn} type="button" data-testid="button-menu" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)} className="grid h-11 w-11 place-items-center rounded-full border border-foreground/20 lg:hidden">
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-foreground/10 bg-background px-5 pb-6 lg:hidden">
          {NAV.map((n) => (
            <Link key={n.label} href={n.href} onClick={() => setOpen(false)} data-testid={`link-mnav-${n.label.toLowerCase()}`} className="block border-b border-foreground/10 py-4 font-display text-2xl font-bold">{n.label}</Link>
          ))}
          <a href={RESUME} download="Je-Sai-Kailash-Pulipati-Resume.pdf" data-testid="link-mnav-resume" className="mt-4 inline-flex min-h-11 items-center gap-2 font-mono text-sm uppercase tracking-widest text-primary">Download résumé <Download className="h-4 w-4" aria-hidden /></a>
          <a href={`mailto:${CONTACT.email}`} data-testid="link-mnav-email" className="flex min-h-11 items-center font-mono text-sm uppercase tracking-widest text-primary">Email Je</a>
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  const links = [
    { label: "Email", href: `mailto:${CONTACT.email}` },
    { label: "LinkedIn", href: CONTACT.linkedin },
    { label: "GitHub", href: CONTACT.github },
    { label: "Scholar", href: CONTACT.scholar },
  ];
  return (
    <footer className="border-t border-foreground/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 md:px-8 lg:flex-row lg:items-center lg:justify-between">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Je Sai Kailash Pulipati · Data & AI Engineer</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
          {links.map((l) => (
            <a key={l.label} href={l.href} target={l.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" data-testid={`link-footer-${l.label.toLowerCase()}`} className="inline-flex min-h-11 items-center font-mono text-xs uppercase tracking-widest underline-offset-4 hover:text-primary hover:underline">{l.label}</a>
          ))}
          <a href={RESUME} download="Je-Sai-Kailash-Pulipati-Resume.pdf" data-testid="link-footer-resume" className="inline-flex min-h-11 items-center font-mono text-xs uppercase tracking-widest underline-offset-4 hover:text-primary hover:underline">Résumé PDF</a>
          <MotionButton testId="button-footer-motion" withLabel />
        </div>
      </div>
    </footer>
  );
}

function decodeHash(hash: string): string {
  try { return decodeURIComponent(hash.replace(/^#/, "")); } catch { return ""; }
}

function focusTarget(id: string, animate = true) {
  const el = document.getElementById(id);
  if (!el) return false;
  const reduce = document.documentElement.dataset.motion === "paused" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: animate && !reduce ? "smooth" : "instant", block: "start" });
  if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  el.setAttribute("data-scroll-target", "");
  el.focus({ preventScroll: true });
  return true;
}

/** Scrolls to #hash on route change and on same-page hash links only. */
export function ScrollToHash() {
  const [loc] = useLocation();
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      let tries = 0;
      let t = 0;
      const attempt = () => { if (!focusTarget(decodeHash(hash), false) && tries++ < 10) t = window.setTimeout(attempt, 50); };
      t = window.setTimeout(attempt, 20);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [loc]);
  useEffect(() => {
    let frame = 0;
    const scheduleFocus = (id: string, animate = false) => {
      window.cancelAnimationFrame(frame);
      // Let the mobile menu close before measuring the anchor position.
      frame = window.requestAnimationFrame(() => focusTarget(id, animate));
    };
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || !url.hash) return;
      const id = decodeHash(url.hash);
      if (!document.getElementById(id)) return;
      e.preventDefault();
      if (window.location.hash !== url.hash) history.pushState(null, "", url.hash);
      scheduleFocus(id, true);
    };
    document.addEventListener("click", onClick, true);
    const onHashChange = () => {
      if (window.location.hash) scheduleFocus(decodeHash(window.location.hash));
    };
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHashChange);
    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHashChange);
    };
  }, []);
  return null;
}
