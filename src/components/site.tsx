import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ArrowRight, ArrowUpRight, Download, Menu, X } from "lucide-react";
import { CONTACT, RESUME } from "@/data";

export function Reveal({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

export function Aurora() {
  return <div className="aurora" aria-hidden><span className="a1" /><span className="a2" /><span className="a3" /></div>;
}

type HBProps = { children: ReactNode; href: string; external?: boolean; download?: boolean; variant?: "solid" | "line"; icon?: "arrow" | "out" | "down"; testId: string };
export function HoverButton({ children, href, external, download, variant = "solid", icon = "arrow", testId }: HBProps) {
  const Icon = icon === "down" ? Download : icon === "out" ? ArrowUpRight : ArrowRight;
  const base = variant === "solid"
    ? "bg-foreground text-background border-foreground"
    : "bg-transparent text-foreground border-foreground/30";
  const inner = (
    <>
      <span className="absolute left-4 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-accent transition-transform duration-500 ease-out group-hover:scale-[60] group-focus-visible:scale-[60]" />
      <span className="relative z-10 inline-block transition-transform duration-300 group-hover:translate-x-10 group-hover:opacity-0 group-focus-visible:translate-x-10 group-focus-visible:opacity-0">{children}</span>
      <span className="absolute inset-0 z-10 flex translate-x-10 items-center justify-center gap-2 text-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
        {children}<Icon className="h-4 w-4" />
      </span>
    </>
  );
  const cls = `group relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-full border pl-9 pr-6 py-3 font-mono text-[13px] uppercase tracking-wider active:scale-[.97] transition-transform ${base}`;
  if (external || download) {
    return <a data-testid={testId} href={href} className={cls} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} {...(download ? { download: "Je-Sai-Kailash-Pulipati-Resume.pdf" } : {})}>{inner}</a>;
  }
  return <Link data-testid={testId} href={href} className={cls}>{inner}</Link>;
}

const NAV = [
  { label: "Story", href: "/#story" },
  { label: "Work", href: "/work" },
  { label: "Research", href: "/#research" },
  { label: "Contact", href: "/#contact" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [loc] = useLocation();
  useEffect(() => setOpen(false), [loc]);
  return (
    <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href="/" data-testid="link-home" className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-primary font-mono text-xs text-primary-foreground">JK</span>
          <span className="font-display text-lg font-bold">Je Kailash</span>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <Link key={n.label} href={n.href} data-testid={`link-nav-${n.label.toLowerCase()}`} className="font-mono text-xs uppercase tracking-widest text-foreground/70 transition-colors hover:text-primary">{n.label}</Link>
          ))}
          <a href={RESUME} download="Je-Sai-Kailash-Pulipati-Resume.pdf" data-testid="link-nav-resume" className="inline-flex items-center gap-2 rounded-full border border-foreground/25 px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors hover:border-accent hover:bg-accent">
            Résumé <Download className="h-3.5 w-3.5" />
          </a>
        </nav>
        <button data-testid="button-menu" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)} className="grid h-11 w-11 place-items-center rounded-full border border-foreground/20 md:hidden">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-foreground/10 bg-background px-5 pb-6 md:hidden">
          {NAV.map((n) => (
            <Link key={n.label} href={n.href} onClick={() => setOpen(false)} data-testid={`link-mnav-${n.label.toLowerCase()}`} className="block border-b border-foreground/10 py-4 font-display text-2xl font-bold">{n.label}</Link>
          ))}
          <a href={RESUME} download="Je-Sai-Kailash-Pulipati-Resume.pdf" data-testid="link-mnav-resume" className="mt-4 inline-flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-primary">Download résumé <Download className="h-4 w-4" /></a>
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
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Je Sai Kailash Pulipati · Data & AI Engineer</p>
        <div className="flex flex-wrap gap-5">
          {links.map((l) => (
            <a key={l.label} href={l.href} target={l.href.startsWith("mailto") ? undefined : "_blank"} rel="noreferrer" data-testid={`link-footer-${l.label.toLowerCase()}`} className="font-mono text-xs uppercase tracking-widest underline-offset-4 hover:text-primary hover:underline">{l.label}</a>
          ))}
          <a href={RESUME} download="Je-Sai-Kailash-Pulipati-Resume.pdf" data-testid="link-footer-resume" className="font-mono text-xs uppercase tracking-widest underline-offset-4 hover:text-primary hover:underline">Résumé PDF</a>
        </div>
      </div>
    </footer>
  );
}

export function ScrollToHash() {
  const [loc] = useLocation();
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView(), 60);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
    return undefined;
  }, [loc]);
  useEffect(() => {
    const onClick = () => setTimeout(() => {
      const h = window.location.hash;
      if (h) document.getElementById(h.slice(1))?.scrollIntoView();
    }, 30);
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);
  return null;
}
