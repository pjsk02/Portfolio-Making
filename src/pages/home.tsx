import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowDown, ArrowUpRight, Mail } from "lucide-react";
import { Ambient, HoverButton, Reveal } from "@/components/site";
import { RagDiagram } from "@/components/rag-diagram";
import { AgentWorkshop } from "@/components/workshop";
import { FieldConnections } from "@/components/field-connections";
import { ResponsiveImage } from "@/components/responsive-image";
import { CONTACT, EXPERIENCE, PAPERS, PROJECTS, RESUME, img } from "@/data";

const CHAPTERS = [
  { n: "01", id: "station-01", place: "Align Associates", role: "Data Analyst", title: "Learn what the numbers are for.",
    body: "Forecasting delivery, profiling data before QA trusted it, sitting in sprint reviews to agree what a KPI actually means. Before building systems, I learned what the people downstream of them needed to decide.",
    carry: "Carried forward: ask who is waiting on the number." },
  { n: "02", id: "station-02", place: "Boviet Solar Technologies", role: "Data Engineer", title: "Go where the data is made.",
    body: "A solar module manufacturer: SAP, Oracle and Fabric on one side, departments waiting on reports on the other. I built the pipelines between them, automated SAP extraction with Python RPA, and set up CDC replication from Oracle into PostgreSQL and Azure Data Lake.",
    carry: "Carried forward: know where every row came from." },
  { n: "03", id: "station-03", place: "Stealth startups", role: "Builder", title: "Make the messy stuff retrievable.",
    body: "Early teams have more documents than structure. I helped stealth startups turn text, images and tables into something users and agents can query, without naming them here.",
    carry: "Carried forward: retrieval is a data problem first." },
  { n: "04", id: "station-04", place: "On my own time", role: "Learning by shipping", title: "Build the AI, then question it.",
    body: "Agents that disagree on purpose, a segmentation model that runs in the browser, a grocery bot that speaks Hinglish. Each one is an argument about where the model should live and what it should not do.",
    carry: "Carried forward: give every model a job description." },
  { n: "05", id: "station-05", place: "Hackathons and events", role: "Teammate, organizer", title: "Build in the room.",
    body: "Hackathons are where ideas meet a deadline and a team. MedFind won The Open Accelerator Hackathon with four teammates. I also help organize events that bring builders together.",
    carry: "Carried forward: a deadline is a design constraint." },
];

const ROUTE = [
  { k: "Analyst", sub: "Read the numbers", href: "#station-01" },
  { k: "Data engineer", sub: "Build where data is made", href: "#station-02" },
  { k: "Applied AI", sub: "Make it retrievable", href: "#station-03" },
];

function NextCue({ href, label, testId }: { href: string; label: string; testId: string }) {
  return (
    <a href={href} data-testid={testId} className="next-cue group mt-16 flex min-h-11 items-center gap-4 border-t border-foreground/15 pt-6 font-mono text-xs uppercase tracking-[.2em] text-foreground/75 hover:text-primary">
      <span className="text-primary">Next</span>
      <span className="h-px flex-1 bg-foreground/15" aria-hidden />
      <span>{label}</span>
      <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" aria-hidden />
    </a>
  );
}

function Story() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  useEffect(() => {
    let frame = 0;
    let readingLine = 112;
    const update = () => {
      frame = 0;
      let current = 0;
      // Visibility is for reveals, not navigation: several chapters can be
      // visible at once. Select the last heading to cross the reading line.
      refs.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= readingLine) current = i;
      });
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    const measure = () => {
      const first = refs.current[0];
      readingLine = (first ? Number.parseFloat(getComputedStyle(first).scrollMarginTop) || 96 : 96) + 16;
      onScroll();
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);
  return (
    <section id="story" aria-labelledby="story-h" className="responsive-section mx-auto max-w-7xl scroll-mt-20 px-5 py-24 md:px-8 md:py-32">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[.25em] text-primary">The line, station by station</p>
        <h2 id="story-h" className="responsive-heading font-display mt-4 max-w-3xl text-4xl font-bold md:text-6xl">Five stations. Each one changed <span className="font-serif font-normal italic">what I build.</span></h2>
      </Reveal>
      <div className="story-layout mt-16 grid gap-10 md:grid-cols-[220px_1fr] md:gap-14">
        <aside className="story-index min-w-0" aria-label="Stations">
          <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground lg:hidden">Jump to a station</p>
          <ol className="sticky top-28 space-y-1">
            {CHAPTERS.map((c, i) => (
              <li key={c.n}>
                <a href={`#${c.id}`} data-testid={`link-station-${c.n}`} aria-label={`${c.n} · ${c.place}`} aria-current={i === active ? "step" : undefined}
                  className={`flex min-h-11 items-center gap-3 font-mono text-[11px] uppercase tracking-widest transition-colors ${i === active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  <span className={`station-mark h-px transition-[width] duration-500 ${i === active ? "w-8 bg-accent" : "w-3 bg-foreground/30"}`} aria-hidden />
                  <span>{c.n}</span><span className="station-place">{c.place}</span>
                </a>
              </li>
            ))}
          </ol>
        </aside>
        <ol className="relative border-l-2 border-dashed border-foreground/20">
          {CHAPTERS.map((c, i) => (
            <li key={c.n} id={c.id} ref={(el) => { refs.current[i] = el; }} className="relative scroll-mt-24 pb-20 pl-8 last:pb-0 md:pl-14" data-testid={`story-chapter-${c.n}`}>
              <span className="absolute -left-[13px] top-1 grid h-6 w-6 place-items-center rounded-full border-2 border-foreground bg-background" aria-hidden>
                <span className={`h-2 w-2 rounded-full transition-transform duration-500 ${i === active ? "scale-150 bg-accent" : "bg-primary"}`} />
              </span>
              <Reveal>
                <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground"><span className="text-primary">{c.n}</span> · {c.place} · {c.role}</p>
                <h3 className="font-display mt-3 text-3xl font-bold md:text-5xl">{c.title}</h3>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-foreground/80">{c.body}</p>
                <p className="mt-5 inline-block border-l-2 border-accent pl-3 font-serif text-xl italic text-foreground/85">{c.carry}</p>
                {c.n === "03" && <div><a href="#rag" data-testid="link-story-rag" className="mt-5 inline-flex min-h-11 items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary hover:underline">Jump to the case <ArrowDown className="h-3.5 w-3.5" aria-hidden /></a></div>}
                {c.n === "05" && (
                  <figure className="mt-6 max-w-xl">
                    <ResponsiveImage file="xiuWhxxcqu2iekfpMQyPLV8Cw-7ab020c1b1b4dcbf.jpeg" alt="The MedFind team at The Open Accelerator Hackathon with their certificate and prizes" sizes="(min-width: 640px) 576px, calc(100vw - 76px)" className="h-auto w-full rounded-lg" />
                    <figcaption className="mt-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">MedFind team, The Open Accelerator Hackathon.</figcaption>
                  </figure>
                )}
                {i < CHAPTERS.length - 1 && (
                  <a href={`#${CHAPTERS[i + 1].id}`} className="mt-6 flex min-h-11 w-fit items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-primary" data-testid={`link-next-station-${c.n}`}>
                    Next station: {CHAPTERS[i + 1].place} <ArrowDown className="h-3.5 w-3.5" aria-hidden />
                  </a>
                )}
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
      <NextCue href="#rag" label="The evidence: case 00" testId="link-next-rag" />
    </section>
  );
}

export default function Home() {
  const leads = PROJECTS.filter((p) => p.tier === "lead");
  const features = PROJECTS.filter((p) => p.tier === "feature");
  return (
    <div>
      {/* HERO */}
      <section aria-labelledby="hero-h" className="relative overflow-hidden border-b border-foreground/10">
        <Ambient />
        <div className="hero-layout relative mx-auto grid max-w-7xl gap-12 px-5 pb-14 pt-14 md:grid-cols-[1.45fr_1fr] md:px-8 md:pb-20 md:pt-20">
          <div className="hero-in">
            <p className="font-mono text-xs uppercase tracking-[.25em] text-primary">Je Sai Kailash Pulipati · Data & AI Engineer</p>
            <h1 id="hero-h" className="font-display mt-6 text-[clamp(2.7rem,7.6vw,6.6rem)] font-extrabold leading-[.92]">
              I started by reading the numbers.
              <span className="block font-serif text-[1.04em] font-normal italic tracking-normal text-primary">Now I build what reads them.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-foreground/80">
              Analyst, then data engineer at a solar manufacturer, then retrieval systems for stealth startups. The AI work carries a habit from the factory floor: know where the data comes from, and who is waiting on it.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <HoverButton href="/work" testId="button-hero-work">See the work</HoverButton>
              <HoverButton href={RESUME} download variant="line" icon="down" testId="button-hero-resume">Résumé</HoverButton>
            </div>
            <p className="mt-6 flex flex-wrap items-center gap-x-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              <span>In a hurry?</span>
              <a href="#rag" data-testid="link-hero-evidence" className="inline-flex min-h-11 items-center text-foreground underline decoration-accent decoration-2 underline-offset-4 hover:text-primary">Best evidence</a>
              <a href={`mailto:${CONTACT.email}`} data-testid="link-hero-email" className="inline-flex min-h-11 items-center text-foreground underline decoration-accent decoration-2 underline-offset-4 hover:text-primary">Email Je</a>
            </p>
          </div>
          <div className="hero-in hero-in-2 relative mx-auto w-full max-w-sm self-start md:mt-4">
            <div className="absolute -inset-3 rotate-2 rounded-lg bg-accent" aria-hidden />
            <img src={img("je-portrait.webp")} srcSet={`${img("je-portrait-small.webp")} 480w, ${img("je-portrait-medium.webp")} 720w, ${img("je-portrait.webp")} 960w`} sizes="(min-width: 1053px) 384px, (min-width: 768px) calc((100vw - 112px) / 2.45), (min-width: 424px) 384px, calc(100vw - 40px)"
              width={800} height={1000} loading="eager" fetchPriority="high" decoding="async"
              alt="Je Sai Kailash Pulipati standing under a pine tree, arms crossed" className="portrait relative aspect-[4/5] w-full rounded-lg object-cover" data-testid="img-portrait" />
            <p className="relative mt-4 font-mono text-[11px] uppercase tracking-widest text-accent-foreground">Fig. 1 · The engineer, off shift.</p>
          </div>
        </div>

        {/* route map: what is next */}
        <nav aria-label="The route" className="relative border-t border-foreground/10 bg-background/70">
          <ol className="mx-auto grid max-w-7xl grid-cols-1 px-5 sm:grid-cols-3 md:px-8">
            {ROUTE.map((r, i) => (
              <li key={r.k} className="border-foreground/10 sm:border-l sm:first:border-l-0">
                <a href={r.href} data-testid={`link-route-${i}`} className="group flex min-h-16 items-center gap-4 py-4 sm:px-5 sm:first:pl-0">
                  <span className="font-mono text-[11px] text-primary">0{i + 1}</span>
                  <span className="flex-1">
                    <span className="block font-display text-lg font-bold leading-tight">{r.k}</span>
                    <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{r.sub}</span>
                  </span>
                  <span className="route-dot h-2.5 w-2.5 rounded-full bg-accent" style={{ animationDelay: `${i * 0.6}s` }} aria-hidden />
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      <Story />

      {/* RAG CASE */}
      <section id="rag" aria-labelledby="rag-h" className="scroll-mt-16 border-y border-foreground/10 bg-secondary/60">
        <div className="responsive-section mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
          <Reveal className="grid gap-10 md:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="font-mono text-xs uppercase tracking-[.25em] text-primary">Case 00 · Stealth startup · Anonymized</p>
              <h2 id="rag-h" className="responsive-heading font-display mt-4 text-4xl font-bold md:text-6xl">From months of data preparation <span className="font-serif font-normal italic text-primary">to days.</span></h2>
            </div>
            <div className="space-y-5 text-lg leading-relaxed text-foreground/85 md:pt-10">
              <p>For a stealth startup, I built a multimodal hybrid RAG pipeline that made information across text, images and tables retrievable for users and agents.</p>
              <p>It combined vector indexing, a Graphify knowledge graph that identifies relationships, and multimodal-LLM-guided retrieval. The result helped the team reduce data processing and cleaning from months to days.</p>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">The time saved is in preparing the data, not in answer latency.</p>
            </div>
          </Reveal>
          <Reveal className="mt-14"><RagDiagram /></Reveal>
          <NextCue href="#workshop" label="How I set agents to work" testId="link-next-workshop" />
        </div>
      </section>

      {/* WORKSHOP */}
      <section id="workshop" aria-labelledby="workshop-h" className="responsive-section mx-auto max-w-7xl scroll-mt-16 px-5 py-24 md:px-8 md:py-32">
        <Reveal className="grid gap-6 md:grid-cols-[1fr_1fr] md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[.25em] text-primary">The workshop</p>
            <h2 id="workshop-h" className="responsive-heading font-display mt-4 text-4xl font-bold md:text-6xl">Small agents, <span className="font-serif font-normal italic">narrow jobs.</span></h2>
          </div>
          <p className="max-w-lg text-lg leading-relaxed text-foreground/80">A production line works when each station does one thing and passes on something checkable. This sketch applies the same idea to agents. Click an agent or its line, or turn the dial, to see who does what.</p>
        </Reveal>
        <Reveal className="mt-12"><AgentWorkshop /></Reveal>
        <NextCue href="#connections" label="How the work connects" testId="link-next-connections" />
      </section>

      <FieldConnections />

      {/* WORK */}
      <section id="work" aria-labelledby="work-h" className="responsive-tail mx-auto max-w-7xl scroll-mt-16 px-5 pb-24 md:px-8 md:pb-32">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[.25em] text-primary">Selected work</p>
            <h2 id="work-h" className="responsive-heading font-display mt-4 text-4xl font-bold md:text-6xl">Systems with a point of view.</h2>
          </div>
          <HoverButton href="/work" variant="line" testId="button-all-work">{`All ${PROJECTS.length} projects`}</HoverButton>
        </Reveal>
        <div className="mt-14 space-y-20">
          {leads.map((p, i) => (
            <Reveal key={p.slug}>
              <Link href={`/work/${p.slug}`} data-testid={`card-lead-${p.slug}`} className={`group grid items-center gap-8 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <div className="overflow-hidden rounded-lg border border-foreground/10">
                  <ResponsiveImage file={p.cover} alt={p.coverAlt} sizes="(min-width: 1280px) 592px, (min-width: 768px) calc((100vw - 96px) / 2), calc(100vw - 40px)" className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{p.context}</p>
                  <h3 className="font-display mt-3 text-4xl font-bold md:text-5xl">{p.title}</h3>
                  <p className="mt-2 font-serif text-2xl italic text-primary">{p.line}</p>
                  <p className="mt-4 max-w-md text-lg text-foreground/80">{p.short}</p>
                  <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest">
                    <span className="border-b border-foreground pb-0.5 transition-colors group-hover:border-accent">Read the case</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="home-features mt-24 grid gap-x-8 gap-y-12 md:grid-cols-6">
          {features.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 80} className={i % 5 === 0 ? "md:col-span-4" : i % 5 === 1 ? "md:col-span-2" : "md:col-span-3"}>
              <Link href={`/work/${p.slug}`} data-testid={`card-feature-${p.slug}`} className="group block">
                <div className="overflow-hidden rounded-lg border border-foreground/10 bg-card">
                  <ResponsiveImage file={p.cover} alt={p.coverAlt} sizes={`(min-width: 1280px) ${i % 5 === 0 ? 800 : i % 5 === 1 ? 384 : 592}px, (min-width: 1024px) calc((100vw - ${i % 5 === 0 ? 80 : i % 5 === 1 ? 128 : 96}px) / ${i % 5 === 0 ? 1.5 : i % 5 === 1 ? 3 : 2}), (min-width: 768px) calc((100vw - 96px) / 2), (min-width: 640px) calc((100vw - 72px) / 2), calc(100vw - 40px)`} className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-2xl font-bold">{p.title}</h3>
                  <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" aria-hidden />
                </div>
                <p className="mt-1 text-foreground/75">{p.short}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" aria-labelledby="exp-h" className="scroll-mt-16 bg-ink text-on-ink">
        <div className="responsive-section mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-28">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[.25em] text-accent">For the skimmers</p>
            <h2 id="exp-h" className="responsive-heading font-display mt-4 text-4xl font-bold md:text-6xl">The shift log.</h2>
          </Reveal>
          <div className="mt-12 divide-y divide-on-ink/15 border-y border-on-ink/15">
            {EXPERIENCE.map((e) => (
              <Reveal key={e.org} className="grid gap-6 py-8 md:grid-cols-[1fr_2fr] md:gap-10">
                <div>
                  <h3 className="font-display text-3xl font-bold leading-tight">{e.role}</h3>
                  <p className="mt-3 font-mono text-xs uppercase tracking-widest text-accent">{e.org}</p>
                  <p className="mt-1 font-mono text-xs uppercase tracking-widest text-on-ink/70">{e.when}</p>
                </div>
                <ul className="space-y-2 text-on-ink/85">
                  {e.points.map((pt) => <li key={pt} className="flex gap-3"><span className="mt-2.5 h-1 w-3 shrink-0 bg-accent" aria-hidden />{pt}</li>)}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* RESEARCH */}
      <section id="research" aria-labelledby="research-h" className="responsive-section mx-auto max-w-7xl scroll-mt-16 px-5 py-24 md:px-8 md:py-28">
        <Reveal className="grid gap-10 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[.25em] text-primary">Research</p>
            <h2 id="research-h" className="font-display mt-4 text-4xl font-bold">Four IEEE papers, co-authored.</h2>
            <a href={CONTACT.scholar} target="_blank" rel="noreferrer" data-testid="link-scholar" className="mt-6 inline-flex min-h-11 items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary hover:underline">Google Scholar <ArrowUpRight className="h-4 w-4" aria-hidden /></a>
          </div>
          <ul className="divide-y divide-foreground/10 border-y border-foreground/10">
            {PAPERS.map((p, i) => (
              <li key={p.href}>
                <a href={p.href} target="_blank" rel="noreferrer" data-testid={`link-paper-${i}`} className="group flex items-start gap-6 py-5 transition-colors hover:bg-secondary/60 md:px-3">
                  <span className="font-mono text-xs text-muted-foreground">{p.year}</span>
                  <span className="flex-1 text-lg leading-snug">{p.title}</span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* CONTACT */}
      <section id="contact" aria-labelledby="contact-h" className="relative scroll-mt-16 overflow-hidden border-t border-foreground/10">
        <Ambient />
        <div className="responsive-section relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-24 md:grid-cols-[minmax(0,1fr)_260px] md:gap-10 md:px-8 md:py-32 lg:grid-cols-[minmax(0,1fr)_300px]">
          <Reveal className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-[.25em] text-primary">End of the line. Or the next station.</p>
            <h2 id="contact-h" className="font-display mt-4 max-w-4xl text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-[.95]">Have data nobody can find? <span className="font-serif font-normal italic text-primary">Let's talk.</span></h2>
            <a href={`mailto:${CONTACT.email}`} data-testid="link-contact-email" className="mt-10 inline-flex max-w-full items-center gap-3 font-display text-xl font-bold underline decoration-accent decoration-4 underline-offset-8 lg:text-3xl">
              <Mail className="h-6 w-6 shrink-0" aria-hidden /><span className="min-w-0 break-all">{CONTACT.email}</span>
            </a>
            <div className="mt-12 flex flex-wrap gap-3">
              <HoverButton href={CONTACT.linkedin} external icon="out" testId="button-contact-linkedin">LinkedIn</HoverButton>
              <HoverButton href={CONTACT.github} external icon="out" variant="line" testId="button-contact-github">GitHub</HoverButton>
              <HoverButton href={CONTACT.scholar} external icon="out" variant="line" testId="button-contact-scholar">Scholar</HoverButton>
              <HoverButton href={RESUME} download icon="down" variant="line" testId="button-contact-resume">Résumé PDF</HoverButton>
            </div>
          </Reveal>
          <Reveal className="mx-auto w-full max-w-[300px] md:mx-0">
            <figure className="relative">
              <div className="absolute -inset-2 -rotate-2 rounded-lg border border-primary/40 bg-secondary" aria-hidden />
              <img src={img("je-portrait-closing.webp")}
                srcSet={`${img("je-portrait-closing-small.webp")} 320w, ${img("je-portrait-closing.webp")} 640w`}
                sizes="(min-width: 1024px) 300px, (min-width: 768px) 260px, 80vw"
                width={640} height={800} loading="lazy" decoding="async"
                alt="Je Sai Kailash Pulipati in a black shirt, looking to the side"
                className="relative aspect-[4/5] w-full rounded-lg object-cover" data-testid="img-portrait-closing" />
              <figcaption className="relative mt-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Je Sai Kailash Pulipati</figcaption>
            </figure>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
