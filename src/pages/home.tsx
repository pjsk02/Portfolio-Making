import { Link } from "wouter";
import { ArrowUpRight, Mail } from "lucide-react";
import { Aurora, HoverButton, Reveal } from "@/components/site";
import { RagDiagram } from "@/components/rag-diagram";
import { CONTACT, EXPERIENCE, PAPERS, PROJECTS, RESUME, img } from "@/data";

const CHAPTERS = [
  { n: "01", place: "Align Associates", role: "Data Analyst", title: "Learn what the numbers are for.",
    body: "Forecasting delivery, profiling data before QA trusted it, sitting in sprint reviews to agree what a KPI actually means. Before building systems, I learned what the people downstream of them needed to decide." },
  { n: "02", place: "Boviet Solar Technologies", role: "Data Engineer", title: "Go where the data is made.",
    body: "A solar module manufacturer: SAP, Oracle and Fabric on one side, departments waiting on reports on the other. I built the pipelines between them, automated SAP extraction with Python RPA, and set up CDC replication from Oracle into PostgreSQL and Azure Data Lake." },
  { n: "03", place: "Stealth startups", role: "Builder", title: "Make the messy stuff retrievable.",
    body: "Early teams have more documents than structure. I helped stealth startups turn text, images and tables into something users and agents can query, without naming them here." },
  { n: "04", place: "On my own time", role: "Learning by shipping", title: "Build the AI, then question it.",
    body: "Agents that disagree on purpose, a segmentation model that runs in the browser, a grocery bot that speaks Hinglish. Each one is an argument about where the model should live and what it should not do." },
  { n: "05", place: "Hackathons and events", role: "Teammate, organizer", title: "Build in the room.",
    body: "Hackathons are where ideas meet a deadline and a team. MedFind won The Open Accelerator Hackathon with four teammates. I also help organize events that bring builders together." },
];

export default function Home() {
  const leads = PROJECTS.filter((p) => p.tier === "lead");
  const features = PROJECTS.filter((p) => p.tier === "feature");
  return (
    <main>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-foreground/10">
        <Aurora />
        <div className="grid-paper absolute inset-0 opacity-60" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-20 pt-16 md:grid-cols-[1.4fr_1fr] md:px-8 md:pb-28 md:pt-24">
          <div>
            <p className="font-mono text-xs uppercase tracking-[.25em] text-primary">Je Sai Kailash Pulipati · Data & AI Engineer</p>
            <h1 className="font-display mt-6 text-[clamp(2.8rem,8vw,6.8rem)] font-extrabold leading-[.92]">
              I started by reading the numbers.
              <span className="block font-serif text-[1.02em] font-normal italic tracking-normal text-primary">Now I build what reads them.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-foreground/80">
              Analyst, then data engineer at a solar manufacturer, then retrieval systems for stealth startups. The AI work I do carries a habit from the factory floor: know where the data comes from, and who is waiting on it.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <HoverButton href="/work" testId="button-hero-work">See the work</HoverButton>
              <HoverButton href={RESUME} download variant="line" icon="down" testId="button-hero-resume">Résumé</HoverButton>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm md:mt-6">
            <div className="absolute -inset-3 rotate-2 rounded-lg bg-accent" aria-hidden />
            <img src={img("je-portrait.png")} alt="Je Sai Kailash Pulipati standing under a pine tree, arms crossed" className="relative aspect-[4/5] w-full rounded-lg object-cover" data-testid="img-portrait" />
            <p className="relative mt-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Fig. 1 — The engineer, off shift.</p>
          </div>
        </div>
        <div className="relative overflow-hidden border-t border-foreground/10 bg-foreground py-3 text-background">
          <div className="marquee flex w-max gap-10 whitespace-nowrap font-mono text-xs uppercase tracking-[.2em]">
            {Array.from({ length: 2 }).map((_, j) => (
              <span key={j} className="flex gap-10">
                {["SAP", "Oracle CDC", "Kafka", "Snowflake", "Airflow", "Power BI", "Vector index", "Knowledge graph", "Multimodal RAG", "Agents", "ONNX in the browser", "FastAPI"].map((t) => (
                  <span key={t + j} className="flex items-center gap-10">{t}<span className="h-1.5 w-1.5 rounded-full bg-accent" /></span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* STORY */}
      <section id="story" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-24 md:px-8 md:py-32">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[.25em] text-primary">The line, station by station</p>
          <h2 className="font-display mt-4 max-w-3xl text-4xl font-bold md:text-6xl">Five stations. Each one changed what I build.</h2>
        </Reveal>
        <ol className="relative mt-16 border-l-2 border-dashed border-foreground/20">
          {CHAPTERS.map((c, i) => (
            <li key={c.n} className="relative pb-16 pl-8 last:pb-0 md:pl-14" data-testid={`story-chapter-${c.n}`}>
              <span className="absolute -left-[13px] top-1 grid h-6 w-6 place-items-center rounded-full border-2 border-foreground bg-background">
                <span className={`h-2 w-2 rounded-full ${i === 2 ? "bg-accent" : "bg-primary"}`} />
              </span>
              <Reveal className="grid gap-4 md:grid-cols-[180px_1fr] md:gap-10">
                <div>
                  <p className="font-display text-5xl font-extrabold text-primary/25">{c.n}</p>
                  <p className="font-mono text-[11px] uppercase tracking-widest">{c.place}</p>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{c.role}</p>
                </div>
                <div>
                  <h3 className="font-display text-2xl font-bold md:text-4xl">{c.title}</h3>
                  <p className="mt-3 max-w-2xl text-lg leading-relaxed text-foreground/75">{c.body}</p>
                  {c.n === "03" && <a href="#rag" data-testid="link-story-rag" className="mt-4 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-primary hover:underline">Read the case below <ArrowUpRight className="h-3.5 w-3.5 rotate-90" /></a>}
                  {c.n === "05" && (
                    <figure className="mt-6 max-w-xl">
                      <img src={img("xiuWhxxcqu2iekfpMQyPLV8Cw-7ab020c1b1b4dcbf.jpeg")} alt="The MedFind team at The Open Accelerator Hackathon with their certificate and prizes" className="w-full rounded-lg" loading="lazy" />
                      <figcaption className="mt-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">MedFind team, The Open Accelerator Hackathon.</figcaption>
                    </figure>
                  )}
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* RAG CASE */}
      <section id="rag" className="scroll-mt-16 border-y border-foreground/10 bg-secondary/60">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
          <Reveal className="grid gap-10 md:grid-cols-[1fr_1.1fr]">
            <div>
              <p className="font-mono text-xs uppercase tracking-[.25em] text-primary">Case 00 · Stealth startup · Anonymized</p>
              <h2 className="font-display mt-4 text-4xl font-bold md:text-6xl">From months of data preparation <span className="font-serif font-normal italic text-primary">to days.</span></h2>
            </div>
            <div className="space-y-5 text-lg leading-relaxed text-foreground/80 md:pt-10">
              <p>For a stealth startup, I built a multimodal hybrid RAG pipeline that made information across text, images and tables retrievable for users and agents.</p>
              <p>It combined vector indexing, a Graphify knowledge graph that identifies relationships, and multimodal-LLM-guided retrieval. The result helped the team reduce data processing and cleaning from months to days.</p>
              <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">The time saved is in preparing the data, not in answer latency.</p>
            </div>
          </Reveal>
          <Reveal className="mt-14"><RagDiagram /></Reveal>
        </div>
      </section>

      {/* WORK */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[.25em] text-primary">Selected work</p>
            <h2 className="font-display mt-4 text-4xl font-bold md:text-6xl">Systems with a point of view.</h2>
          </div>
          <HoverButton href="/work" variant="line" testId="button-all-work">All 12 projects</HoverButton>
        </Reveal>
        <div className="mt-14 space-y-20">
          {leads.map((p, i) => (
            <Reveal key={p.slug}>
              <Link href={`/work/${p.slug}`} data-testid={`card-lead-${p.slug}`} className={`group grid items-center gap-8 md:grid-cols-2 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <div className="overflow-hidden rounded-lg border border-foreground/10">
                  <img src={img(p.cover)} alt={p.coverAlt} loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                </div>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{p.context}</p>
                  <h3 className="font-display mt-3 text-4xl font-bold md:text-5xl">{p.title}</h3>
                  <p className="mt-2 font-serif text-2xl italic text-primary">{p.line}</p>
                  <p className="mt-4 max-w-md text-lg text-foreground/75">{p.short}</p>
                  <span className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest">
                    <span className="border-b border-foreground pb-0.5 transition-colors group-hover:border-accent">Read the case</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        <div className="mt-24 grid gap-x-8 gap-y-12 md:grid-cols-6">
          {features.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 80} className={i % 5 === 0 ? "md:col-span-4" : i % 5 === 1 ? "md:col-span-2" : "md:col-span-3"}>
              <Link href={`/work/${p.slug}`} data-testid={`card-feature-${p.slug}`} className="group block">
                <div className="overflow-hidden rounded-lg border border-foreground/10 bg-card">
                  <img src={img(p.cover)} alt={p.coverAlt} loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                </div>
                <div className="mt-4 flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-2xl font-bold">{p.title}</h3>
                  <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <p className="mt-1 text-foreground/70">{p.short}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* EXPERIENCE */}
      <section id="experience" className="scroll-mt-16 bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-28">
          <Reveal><h2 className="font-display text-4xl font-bold md:text-6xl">The shift log.</h2></Reveal>
          <div className="mt-12 divide-y divide-background/15 border-y border-background/15">
            {EXPERIENCE.map((e) => (
              <Reveal key={e.org} className="grid gap-4 py-8 md:grid-cols-[1fr_2fr]">
                <div>
                  <p className="font-display text-2xl font-bold">{e.org}</p>
                  <p className="font-mono text-xs uppercase tracking-widest text-accent">{e.role}</p>
                  <p className="font-mono text-xs uppercase tracking-widest text-background/55">{e.when}</p>
                </div>
                <ul className="space-y-2 text-background/80">
                  {e.points.map((pt) => <li key={pt} className="flex gap-3"><span className="mt-2.5 h-1 w-3 shrink-0 bg-accent" />{pt}</li>)}
                </ul>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* RESEARCH */}
      <section id="research" className="mx-auto max-w-7xl scroll-mt-16 px-5 py-24 md:px-8 md:py-28">
        <Reveal className="grid gap-10 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="font-mono text-xs uppercase tracking-[.25em] text-primary">Research</p>
            <h2 className="font-display mt-4 text-4xl font-bold">Four IEEE papers, co-authored.</h2>
            <a href={CONTACT.scholar} target="_blank" rel="noreferrer" data-testid="link-scholar" className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary hover:underline">Google Scholar <ArrowUpRight className="h-4 w-4" /></a>
          </div>
          <ul className="divide-y divide-foreground/10 border-y border-foreground/10">
            {PAPERS.map((p, i) => (
              <li key={p.href}>
                <a href={p.href} target="_blank" rel="noreferrer" data-testid={`link-paper-${i}`} className="group flex items-start gap-6 py-5 transition-colors hover:bg-secondary/60 md:px-3">
                  <span className="font-mono text-xs text-muted-foreground">{p.year}</span>
                  <span className="flex-1 text-lg leading-snug">{p.title}</span>
                  <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      {/* CONTACT */}
      <section id="contact" className="relative scroll-mt-16 overflow-hidden border-t border-foreground/10">
        <Aurora />
        <div className="relative mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
          <Reveal>
            <h2 className="font-display max-w-4xl text-[clamp(2.5rem,7vw,5.5rem)] font-extrabold leading-[.95]">Have data nobody can find? <span className="font-serif font-normal italic text-primary">Let's talk.</span></h2>
            <a href={`mailto:${CONTACT.email}`} data-testid="link-contact-email" className="mt-10 inline-flex items-center gap-3 break-all font-display text-2xl font-bold underline decoration-accent decoration-4 underline-offset-8 md:text-4xl">
              <Mail className="h-7 w-7 shrink-0" />{CONTACT.email}
            </a>
            <div className="mt-12 flex flex-wrap gap-3">
              <HoverButton href={CONTACT.linkedin} external icon="out" testId="button-contact-linkedin">LinkedIn</HoverButton>
              <HoverButton href={CONTACT.github} external icon="out" variant="line" testId="button-contact-github">GitHub</HoverButton>
              <HoverButton href={CONTACT.scholar} external icon="out" variant="line" testId="button-contact-scholar">Scholar</HoverButton>
              <HoverButton href={RESUME} download icon="down" variant="line" testId="button-contact-resume">Résumé PDF</HoverButton>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
