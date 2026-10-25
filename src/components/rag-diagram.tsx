import { useState } from "react";
import { FileText, Image, Table2, Boxes, Share2, ScanSearch, Users, Bot } from "lucide-react";

const STEPS = [
  { k: "sources", label: "Sources", text: "Text, images and tables arrive in the formats they were created in. Nothing is useful to an agent yet." },
  { k: "index", label: "Two indexes", text: "Content is embedded into a vector index for similarity, and Graphify builds a knowledge graph that records how entities relate across documents." },
  { k: "retrieve", label: "Guided retrieval", text: "A multimodal LLM decides what to pull: nearest chunks, graph neighbours, or the figure or table that holds the actual number." },
  { k: "answer", label: "Answer", text: "The assembled context goes back to a person asking a question, or to an agent that needs grounded input for its next step." },
];

function Node({ icon: I, label, active }: { icon: typeof FileText; label: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-md border px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors duration-500 ${active ? "border-accent bg-accent text-accent-foreground" : "border-on-ink/25 text-on-ink/80"}`}>
      <I className="h-3.5 w-3.5 shrink-0" aria-hidden />{label}
    </div>
  );
}

export function RagDiagram() {
  const [step, setStep] = useState(0);
  const k = STEPS[step].k;
  return (
    <div className="rounded-xl bg-ink p-5 text-on-ink md:p-8" data-testid="diagram-rag">
      <div className="rag-flow" aria-hidden>
        <div className="grid gap-2">
          <Node icon={FileText} label="Text" active={k === "sources"} />
          <Node icon={Image} label="Images" active={k === "sources"} />
          <Node icon={Table2} label="Tables" active={k === "sources"} />
        </div>
        <Arrow />
        <div className="grid gap-2">
          <Node icon={Boxes} label="Vector index" active={k === "index"} />
          <Node icon={Share2} label="Graphify knowledge graph" active={k === "index"} />
        </div>
        <Arrow rowBreak />
        <Node icon={ScanSearch} label="Multimodal LLM-guided retrieval" active={k === "retrieve"} />
        <Arrow />
        <div className="grid gap-2">
          <Node icon={Users} label="Users" active={k === "answer"} />
          <Node icon={Bot} label="Agents" active={k === "answer"} />
        </div>
      </div>
      <div className="mt-8 border-t border-on-ink/15 pt-6">
        <div role="group" aria-label="Pipeline stages" className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {STEPS.map((s, i) => (
            <button key={s.k} type="button" aria-pressed={i === step} data-testid={`button-rag-step-${s.k}`} onClick={() => setStep(i)}
               className={`min-h-11 rounded-full border px-2 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors sm:px-4 ${i === step ? "border-accent bg-accent text-accent-foreground" : "border-on-ink/30 text-on-ink/85 hover:border-on-ink/70"}`}>
              {String(i + 1).padStart(2, "0")} {s.label}
            </button>
          ))}
        </div>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-on-ink/90" aria-live="polite">{STEPS[step].text}</p>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-on-ink/65">Explanatory diagram, not a live system. Company and model details withheld.</p>
      </div>
    </div>
  );
}

function Arrow({ rowBreak = false }: { rowBreak?: boolean }) {
  return (
    <svg className={`mx-auto h-8 w-8 rotate-90 text-accent sm:h-6 sm:w-10 sm:rotate-0 ${rowBreak ? "rag-row-break" : ""}`} viewBox="0 0 40 24" aria-hidden>
      <line x1="0" y1="12" x2="32" y2="12" stroke="currentColor" strokeWidth="2" strokeDasharray="4 6" />
      <path d="M30 6 L38 12 L30 18" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
