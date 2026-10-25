import { useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/site";
import { PROJECTS, img, type Thread } from "@/data";

const THREADS: ("All" | Thread)[] = ["All", "AI systems", "Data engineering", "Analytics", "Product"];

export default function Work() {
  const [t, setT] = useState<"All" | Thread>("All");
  const list = PROJECTS.filter((p) => t === "All" || p.threads.includes(t));
  const big = list.filter((p) => p.tier !== "archive");
  const archive = list.filter((p) => p.tier === "archive");
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
      <p className="font-mono text-xs uppercase tracking-[.25em] text-primary">Work · {PROJECTS.length} projects</p>
      <h1 className="font-display mt-4 max-w-4xl text-5xl font-extrabold leading-[.95] md:text-7xl">Everything on the bench, <span className="font-serif font-normal italic text-primary">newest ideas first.</span></h1>
      <div role="group" aria-label="Filter projects" className="mt-10 flex flex-wrap gap-2">
        {THREADS.map((x) => (
          <button key={x} onClick={() => setT(x)} aria-pressed={t === x} data-testid={`button-filter-${x.toLowerCase().replace(/\s/g, "-")}`}
            className={`min-h-11 rounded-full border px-4 font-mono text-xs uppercase tracking-wider transition-colors ${t === x ? "border-foreground bg-foreground text-background" : "border-foreground/25 hover:border-foreground"}`}>
            {x}
          </button>
        ))}
      </div>
      <div className="mt-14 grid gap-x-8 gap-y-14 md:grid-cols-2">
        {big.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 2) * 80}>
            <Link href={`/work/${p.slug}`} data-testid={`card-work-${p.slug}`} className="group block">
              <div className="overflow-hidden rounded-lg border border-foreground/10 bg-card">
                <img src={img(p.cover)} alt={p.coverAlt} loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
              </div>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{p.context}</p>
              <div className="mt-1 flex items-baseline justify-between gap-4">
                <h2 className="font-display text-3xl font-bold">{p.title}</h2>
                <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" />
              </div>
              <p className="mt-1 text-foreground/70">{p.short}</p>
            </Link>
          </Reveal>
        ))}
      </div>
      {archive.length > 0 && (
        <section className="mt-24">
          <h2 className="font-mono text-xs uppercase tracking-[.25em] text-muted-foreground">From the archive</h2>
          <ul className="mt-4 divide-y divide-foreground/10 border-y border-foreground/10">
            {archive.map((p) => (
              <li key={p.slug}>
                <Link href={`/work/${p.slug}`} data-testid={`row-archive-${p.slug}`} className="group grid grid-cols-[64px_1fr_auto] items-center gap-5 py-4 transition-colors hover:bg-secondary/60 md:grid-cols-[96px_1fr_1.4fr_auto] md:px-3">
                  <img src={img(p.cover)} alt="" loading="lazy" className="aspect-[4/3] w-full rounded object-cover" />
                  <span className="font-display text-xl font-bold">{p.title}</span>
                  <span className="hidden text-foreground/70 md:block">{p.short}</span>
                  <ArrowUpRight className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
