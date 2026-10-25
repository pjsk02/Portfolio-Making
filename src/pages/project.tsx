import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { HoverButton, Reveal } from "@/components/site";
import { ResponsiveImage } from "@/components/responsive-image";
import { PROJECTS, img } from "@/data";
import NotFound from "@/pages/not-found";

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const idx = PROJECTS.findIndex((p) => p.slug === slug);
  if (idx < 0) return <NotFound />;
  const p = PROJECTS[idx];
  const next = PROJECTS[(idx + 1) % PROJECTS.length];
  return (
    <div>
      <article className="mx-auto max-w-5xl px-5 py-12 md:px-8 md:py-20">
        <Link href="/work" data-testid="link-back-work" className="inline-flex min-h-11 items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> All work
        </Link>
        <p className="mt-10 font-mono text-xs uppercase tracking-[.25em] text-primary">{p.context}</p>
        <h1 className="responsive-title font-display mt-3 font-extrabold leading-[.95]" data-testid="text-project-title">{p.title}</h1>
        <p className="mt-3 font-serif text-2xl italic text-primary md:text-3xl">{p.line}</p>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground/80 md:text-xl">{p.short}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {p.stack.map((s) => <span key={s} className="rounded-full border border-foreground/20 px-3 py-1 font-mono text-[11px] uppercase tracking-wider">{s}</span>)}
        </div>
        {p.links.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-3">
            {p.links.map((l, i) => <HoverButton key={l.href} href={l.href} external icon="out" variant={i ? "line" : "solid"} testId={`button-project-link-${i}`}>{l.label}</HoverButton>)}
          </div>
        )}
        <ResponsiveImage file={p.cover} alt={p.coverAlt} sizes="(min-width: 1024px) 960px, (min-width: 768px) calc(100vw - 64px), calc(100vw - 40px)" loading="eager" className="mt-12 w-full rounded-lg border border-foreground/10" />
        {p.boundary && (
          <aside className="mt-8 flex gap-3 rounded-lg border-l-4 border-accent bg-secondary/70 p-5" data-testid="text-project-boundary">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p><span className="font-mono text-xs uppercase tracking-widest">Scope · </span>{p.boundary}</p>
          </aside>
        )}
        <div className="mt-14 space-y-14">
          {p.sections.map((s) => (
            <Reveal key={s.h} className="grid gap-4 md:grid-cols-[200px_1fr]">
              <h2 className="font-mono text-xs uppercase tracking-[.2em] text-primary md:pt-1.5">{s.h}</h2>
              <div className="space-y-4 text-lg leading-relaxed text-foreground/85">
                {s.p?.map((t) => <p key={t}>{t}</p>)}
                {s.list && <ul className="space-y-3">{s.list.map((t) => <li key={t} className="flex gap-3"><span className="mt-3 h-1 w-3 shrink-0 bg-accent" />{t}</li>)}</ul>}
              </div>
            </Reveal>
          ))}
        </div>
        {p.gallery && (
          <section className="mt-16">
            <h2 className="font-mono text-xs uppercase tracking-[.2em] text-primary">Product screens</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {p.gallery.map((g) => (
                <figure key={g.src}>
                  <img src={img(g.src)} alt={g.caption} loading="lazy" className="w-full rounded-lg border border-foreground/10" />
                  <figcaption className="mt-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{g.caption}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}
      </article>
      <Link href={`/work/${next.slug}`} data-testid="link-next-project" className="group block border-t border-foreground/10 bg-ink text-on-ink">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-6 px-5 py-12 md:px-8">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">Next project</p>
            <p className="font-display mt-2 text-3xl font-bold md:text-5xl">{next.title}</p>
          </div>
          <ArrowRight className="h-8 w-8 shrink-0 transition-transform group-hover:translate-x-2" />
        </div>
      </Link>
    </div>
  );
}
