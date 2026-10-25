import { Fragment, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import { useActiveWhileVisible } from "@/components/prefs";
import { PROJECTS } from "@/data";
import { MotionButton } from "@/components/site";
import "./field-connections.css";

type Evidence = { label: string; href: string; note: string };
type Field = { id: string; name: string; tag: string; line: string; evidence: Evidence[]; caveat?: string; glyph: ReactNode };

const proj = (slug: string) => PROJECTS.find((p) => p.slug === slug);
const caseEv = (slug: string): Evidence[] => {
  const p = proj(slug);
  return p ? [{ label: p.title, href: `/work/${p.slug}`, note: p.short }] : [];
};

const G = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const FIELDS: Field[] = [
  { id: "business", name: "Business questions", tag: "Station 01 · Analyst", line: "Agree what a number means before anyone builds on it.",
    evidence: [{ label: "Align Associates, Data Analyst", href: "/#station-01", note: "Forecasting delivery, profiling data before QA trusted it, and agreeing what a KPI means in sprint reviews." }],
    glyph: <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden><path {...G} d="M4 19V11M10 19V6M16 19v-5M21 19H3" /><circle cx="16" cy="9" r="2" {...G} /></svg> },
  { id: "manufacturing", name: "Manufacturing systems", tag: "Station 02 · Data engineer", line: "Pipelines between SAP, Oracle and the people waiting on reports.",
    evidence: [{ label: "Boviet Solar Technologies, Data Engineer", href: "/#station-02", note: "Automated SAP extraction with Python RPA and set up CDC replication from Oracle into PostgreSQL and Azure Data Lake." }],
    glyph: <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden><path {...G} d="M3 20V10l5 3V10l5 3V6h4v14H3z" /><path {...G} d="M17 9h4v11" /></svg> },
  { id: "teams", name: "Teams and community", tag: "Station 05 · In the room", line: "Ideas meeting a deadline and a team.",
    evidence: [{ label: "Hackathons and events", href: "/#station-05", note: "MedFind won The Open Accelerator Hackathon with four teammates. Je also helps organize events that bring builders together." }],
    glyph: <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden><circle cx="7" cy="9" r="2.5" {...G} /><circle cx="17" cy="9" r="2.5" {...G} /><circle cx="12" cy="6" r="2.5" {...G} /><path {...G} d="M3 19c.5-3 2-4.5 4-4.5M21 19c-.5-3-2-4.5-4-4.5M8 19c.6-3.2 2-5 4-5s3.4 1.8 4 5" /></svg> },
  { id: "retrieval", name: "Retrieval and AI", tag: "Case 00 · Anonymized", line: "Text, images and tables made retrievable for users and agents.",
    evidence: [{ label: "Multimodal hybrid RAG", href: "/#rag", note: "Vector indexing plus a Graphify knowledge graph and multimodal-LLM-guided retrieval. Helped cut data processing and cleaning from months to days." }],
    caveat: "The time saved is in preparing data, not in answer latency.",
    glyph: <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden><circle cx="5" cy="6" r="2" {...G} /><circle cx="19" cy="6" r="2" {...G} /><circle cx="12" cy="18" r="2" {...G} /><circle cx="12" cy="10" r="2.6" {...G} /><path {...G} d="M6.7 7l3 2M17.3 7l-3 2M12 12.6V16" /></svg> },
  { id: "health", name: "Healthcare experiments", tag: "Team projects", line: "Where the model should live when the data is sensitive.",
    evidence: [...caseEv("medfind"), ...caseEv("endoseg")],
    caveat: "MedFind is a hackathon prototype on synthetic data. EndoSeg is experimental and not clinically validated.",
    glyph: <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden><path {...G} d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /><path {...G} d="M8 12h2.5l1-2 1.5 4 1-2H16" /></svg> },
  { id: "energy", name: "Energy", tag: "Side projects", line: "Back to the solar industry, from the software side.",
    evidence: [...caseEv("solarsketch"), ...caseEv("energy-cto")],
    caveat: "SolarSketch is an MVP and Energy CTO a concept; estimates are rough by design.",
    glyph: <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden><path {...G} d="M4 15l3-8h10l3 8H4zM9.5 7l-1 8M14.5 7l1 8M5.5 11h13M12 15v4M8 20h8" /></svg> },
];

type Wire = { d: string; x0: number; y0: number; x1: number; y1: number; mx: number };
function bez(t: number, a: number, b: number, c: number, d: number) {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
}

export function FieldConnections() {
  const [sel, setSel] = useState(3);
  const [peek, setPeek] = useState<number | null>(null);
  const ref = useRef<HTMLElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [geo, setGeo] = useState<{ w: number; h: number; wires: Wire[] } | null>(null);
  useActiveWhileVisible(ref);
  const f = FIELDS[sel];

  // Measure real card and hub edges; re-run only when sizes change (ResizeObserver) or the selection moves the hub.
  useLayoutEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const hub = hubRef.current;
      if (!hub) return;
      const b = board.getBoundingClientRect();
      const h = hub.getBoundingClientRect();
      if (!window.matchMedia("(min-width: 1024px)").matches) { setGeo(null); return; }
      const wires: Wire[] = cardRefs.current.map((el, i) => {
        const r = el?.getBoundingClientRect();
        if (!r) return { d: "", x0: 0, y0: 0, x1: 0, y1: 0, mx: 0 };
        const left = r.left + r.width / 2 < h.left + h.width / 2;
        const row = i % 3;
        const x0 = (left ? r.right : r.left) - b.left;
        const y0 = r.top + r.height / 2 - b.top;
        const x1 = (left ? h.left : h.right) - b.left;
        const y1 = h.top + h.height * (0.3 + row * 0.2) - b.top;
        const mx = (x0 + x1) / 2;
        return { d: `M${x0} ${y0} C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`, x0, y0, x1, y1, mx };
      });
      setGeo({ w: b.width, h: b.height, wires });
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
    ro?.observe(board);
    if (hubRef.current) ro?.observe(hubRef.current);
    cardRefs.current.forEach((el) => el && ro?.observe(el));
    window.addEventListener("resize", schedule);
    return () => { ro?.disconnect(); window.removeEventListener("resize", schedule); if (raf) cancelAnimationFrame(raf); };
  }, [sel]);

  return (
    <section ref={ref} id="connections" aria-labelledby="connections-h" className="fc mx-auto max-w-7xl scroll-mt-16 px-5 py-24 md:px-8 md:py-32">
      <div className="grid gap-6 md:grid-cols-2 md:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[.25em] text-primary">Connected fields</p>
          <h2 id="connections-h" className="font-display mt-4 text-4xl font-bold md:text-6xl">One person, <span className="font-serif font-normal italic">six wires.</span></h2>
        </div>
        <div className="max-w-lg">
          <p className="text-lg leading-relaxed text-foreground/80">The same habit runs through every field: find where the data comes from and who is waiting on it. Pick a field to trace its wire back to the evidence.</p>
          <div className="mt-4"><MotionButton testId="button-connections-motion" withLabel /></div>
        </div>
      </div>

      <p role="status" aria-atomic="true" className="sr-only">Selected field: {f.name}. Its evidence follows the selected field button.</p>
      <div ref={boardRef} className="fc-board mt-12">
        {geo && (
          <svg className="fc-wires" viewBox={`0 0 ${geo.w} ${geo.h}`} aria-hidden>
            {geo.wires.map((w, i) => {
              if (!w.d) return null;
              const on = i === sel;
              return (
                <g key={FIELDS[i].id}>
                  <path d={w.d} className={`fc-wire ${on ? "is-on" : peek === i ? "is-peek" : ""}`} />
                  <circle cx={w.x0} cy={w.y0} r="3.5" className="fc-idle" />
                  <circle cx={w.x1} cy={w.y1} r="3" className="fc-end" />
                  {[0.25, 0.5, 0.75].map((t, k) => (
                    <circle key={t} r="3.2" cx={bez(t, w.x0, w.mx, w.mx, w.x1)} cy={bez(t, w.y0, w.y0, w.y1, w.y1)}
                      className={`fc-pulse ${on ? "is-on" : ""}`} style={{ animationDelay: `${k * 0.35}s` }} />
                  ))}
                </g>
              );
            })}
          </svg>
        )}

        <div className="fc-cards grid gap-3">
          {FIELDS.map((x, i) => (
            <Fragment key={x.id}>
            <button ref={(el) => { cardRefs.current[i] = el; }} type="button" data-slot={i} aria-pressed={i === sel} aria-controls="connections-evidence"
              onClick={() => setSel(i)} onMouseEnter={() => setPeek(i)} onMouseLeave={() => setPeek(null)} onFocus={() => setPeek(i)} onBlur={() => setPeek(null)}
              data-testid={`button-field-${x.id}`} className="fc-card">
              <span className="flex items-start gap-4">
                <span className="fc-disc">{x.glyph}</span>
                <span className="min-w-0">
                  <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{x.tag}</span>
                  <span className="font-display mt-1 block text-xl font-bold leading-tight">{x.name}</span>
                  <span className="mt-1.5 block text-sm leading-relaxed text-foreground/75">{x.line}</span>
                </span>
              </span>
            </button>
            {i === sel && (
              <div className="fc-center" ref={hubRef}>
                <div className="fc-hub" data-testid="panel-connections-hub">
                  <span className="fc-ring fc-orbit" style={{ width: 220, height: 220, right: -70, top: -70, borderStyle: "dashed" }} aria-hidden />
                  <span className="fc-ring" style={{ width: 140, height: 140, right: -30, top: -30 }} aria-hidden />
                  <div className="relative flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent font-mono text-sm font-semibold text-accent-foreground" aria-hidden>JK</span>
                    <div>
                      <p className="font-display text-lg font-bold leading-tight">Je, at the junction</p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-on-ink/70">Wire {String(sel + 1).padStart(2, "0")} of 06</p>
                    </div>
                  </div>
                  <div key={f.id} className="fc-swap relative mt-5" id="connections-evidence" data-testid="text-connections-evidence">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-accent">{f.tag}</p>
                    <p className="font-display mt-1 text-2xl font-bold leading-tight">{f.name}</p>
                    <ul className="mt-4 space-y-3">
                      {f.evidence.map((e) => (
                        <li key={e.href}>
                          <Link href={e.href} data-testid={`link-connections-${f.id}-${e.href.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}`}
                            className="group block rounded-xl border border-on-ink/15 p-3 transition-colors hover:border-accent">
                            <span className="flex min-h-6 items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-widest">
                              {e.label}<ArrowUpRight className="h-4 w-4 shrink-0 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                            </span>
                            <span className="mt-1 block text-sm leading-relaxed text-on-ink/85">{e.note}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    {f.caveat && <p className="mt-3 border-l-2 border-accent pl-3 text-xs leading-relaxed text-on-ink/75">{f.caveat}</p>}
                  </div>
                </div>
              </div>
            )}
            </Fragment>
          ))}
        </div>
      </div>
      <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">A map of where the work has been, drawn from the cases on this site. Nothing here is live.</p>
    </section>
  );
}
