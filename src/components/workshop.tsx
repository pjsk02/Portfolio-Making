import { useId, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from "react";
import { useActiveWhileVisible } from "@/components/prefs";
import { MotionButton } from "@/components/site";

const STAGES = [
  { k: "brief", label: "Brief", agent: -1,
    text: "Before anything moves, Je sets the job: which sources to use, what each agent is allowed to do, and what needs human review. This sketch makes those responsibilities visible." },
  { k: "read", label: "Read", agent: 0,
    text: "The Reader only extracts. Text, images and tables go in; chunks come out with their origin attached. It is not allowed to answer anything, which keeps it boring and easy to test." },
  { k: "link", label: "Link", agent: 1,
    text: "The Linker records how things relate, so a question can follow a relationship instead of guessing from similar words. This is the role a knowledge graph played in the startup pipeline." },
  { k: "check", label: "Check", agent: 2,
    text: "The Checker compares a draft against what was actually retrieved. Its job is to be suspicious, not helpful." },
] as const;

const AGENTS = ["Reader", "Linker", "Checker"];
const AGENT_CABLES = [260, 400, 540].map((x, i) => ({
  key: STAGES[i + 1].k,
  stage: i + 1,
  name: `${AGENTS[i]} cable — select ${STAGES[i + 1].label} stage`,
  path: `M140 196 C ${170 + i * 20} 120, ${x - 40} 110, ${x} 150`,
}));
const REVIEW_CABLE = {
  key: "review",
  stage: 3,
  name: "Human review return line — select Check stage",
  path: "M540 190 C 520 80, 200 70, 92 150",
};

export function AgentWorkshop() {
  const [stage, setStage] = useState(0);
  const [review, setReview] = useState(true);
  const svgRef = useRef<SVGSVGElement>(null);
  const cableRefs = useRef<Record<string, SVGGElement | null>>({});
  const touchTarget = useRef<SVGElement | null | undefined>(undefined);
  useActiveWhileVisible(svgRef);
  const uid = useId();
  const s = STAGES[stage];
  const reviewNote = review
    ? "Human review is on: anything the Checker cannot ground goes back to Je instead of shipping."
    : "Human review is off: the Checker can only flag. Fine for a sketch, not how I would ship it.";
  const desc = `Illustration. Je stands at a console with a dial set to ${s.label}. Three small agents, Reader, Linker and Checker, sit on a conveyor carrying text, image and table parcels. ${s.agent >= 0 ? `${AGENTS[s.agent]} is highlighted.` : "Je is configuring all three."} ${reviewNote}`;
  const on = (i: number) => s.agent === -1 || s.agent === i;
  // Unmount both hit areas and the control when the return line is hidden.
  const cables = review && s.k === "check" ? [...AGENT_CABLES, REVIEW_CABLE] : AGENT_CABLES;
  const stageTarget = (i: number, name: string) => ({
    role: "button",
    tabIndex: 0,
    "aria-label": name,
    "aria-pressed": stage === i,
    "aria-controls": `${uid}explain`,
    "data-workshop-stage": i,
    onClick: () => setStage(i),
    onKeyDown: (event: KeyboardEvent<SVGGElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault(); // Space selects instead of scrolling the page.
        if (!event.repeat) setStage(i);
      }
    },
  });
  const captureTouchTarget = (event: PointerEvent<SVGSVGElement>) => {
    // Mobile browsers may redirect a tap to a nearby SVG button, even across
    // the noninteractive conveyor. Keep the original, unadjusted hit geometry.
    touchTarget.current = event.pointerType === "touch"
      ? document.elementFromPoint(event.clientX, event.clientY)?.closest<SVGElement>("[data-workshop-stage]") ?? null
      : undefined;
    // Don't let the adjusted compatibility mousedown focus a nearby button.
    if (touchTarget.current === null) event.preventDefault();
  };
  const activateTouchTarget = (event: MouseEvent<SVGSVGElement>) => {
    const target = touchTarget.current;
    touchTarget.current = undefined;
    // Keyboard/assistive clicks have no pointer coordinates to validate.
    if (event.detail === 0 || target === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    if (!target || !svgRef.current?.contains(target)) return;
    const cableKey = target.getAttribute("data-cable");
    const control = cableKey ? cableRefs.current[cableKey] : target;
    control?.focus({ preventScroll: true });
    setStage(Number(target.getAttribute("data-workshop-stage")));
  };

  return (
    <figure className="overflow-hidden rounded-2xl border border-foreground/12 bg-card" data-testid="workshop">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/10 px-4 py-3 md:px-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[.2em] text-muted-foreground">Fig. 2 · Agent workshop</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-foreground/70" data-testid="text-workshop-label">Illustration, not running agents</p>
        </div>
        <MotionButton testId="button-workshop-motion" />
      </div>

      <div className="workshop-grid grid md:grid-cols-[1.35fr_1fr]">
        <div className="relative bg-secondary/50 p-3 md:p-6">
          <svg ref={svgRef} viewBox="0 0 640 360" className="workshop h-auto w-full" role="group" aria-labelledby={`${uid}t`} aria-describedby={`${uid}d`} data-stage={s.k} data-review={review ? "on" : "off"}
            onPointerDownCapture={captureTouchTarget} onPointerCancel={() => { touchTarget.current = null; }} onClickCapture={activateTouchTarget}>
            <title id={`${uid}t`}>Agent workshop illustration</title>
            <desc id={`${uid}d`}>{desc}</desc>

            {/* floor + conveyor */}
            <g aria-hidden="true">
              <line x1="0" y1="318" x2="640" y2="318" className="ws-line" strokeWidth="2" />
              <rect x="196" y="290" width="430" height="16" rx="8" className="ws-belt" />
              {Array.from({ length: 9 }).map((_, i) => <circle key={i} cx={212 + i * 50} cy="298" r="4" className="ws-roller" />)}
            </g>

            {/* parcels riding the belt */}
            <g className="ws-parcels" aria-hidden="true">
              <g className="parcel p1"><rect x="0" y="-16" width="20" height="16" rx="2" className="ws-paper" /><line x1="4" y1="-11" x2="16" y2="-11" className="ws-ink" /><line x1="4" y1="-6" x2="13" y2="-6" className="ws-ink" /></g>
              <g className="parcel p2"><rect x="0" y="-16" width="20" height="16" rx="2" className="ws-paper" /><path d="M3 -3 L8 -10 L12 -5 L15 -8 L18 -3Z" className="ws-fill-primary" /></g>
              <g className="parcel p3"><rect x="0" y="-16" width="20" height="16" rx="2" className="ws-paper" /><path d="M2 -10 H18 M2 -5 H18 M8 -16 V0" className="ws-ink" /></g>
            </g>

            {/* Wide, solid hit strokes stay behind ALL cable centerlines, so a
                neighboring cable's padding cannot steal a precise line click.
                Non-scaling strokes keep the target usable at mobile sizes. */}
            <g className="ws-cables">
              <g aria-hidden="true">
                {cables.map((cable) => (
                  <path key={cable.key} d={cable.path} className="ws-cable-hit" data-cable={cable.key} data-workshop-stage={cable.stage}
                    onClick={() => {
                      cableRefs.current[cable.key]?.focus({ preventScroll: true });
                      setStage(cable.stage);
                    }} />
                ))}
              </g>
              {cables.map((cable) => (
                <g key={cable.key} {...stageTarget(cable.stage, cable.name)} className="ws-target ws-cable-target"
                  ref={(node) => { cableRefs.current[cable.key] = node; }}
                  data-testid={`button-workshop-cable-${cable.key}`}>
                  <path d={cable.path} className="ws-cable-core" aria-hidden="true" />
                  <path d={cable.path} className="ws-cable-focus" aria-hidden="true" />
                  <path d={cable.path} fill="none" strokeWidth="2" strokeDasharray={cable.key === "review" ? "2 7" : "5 6"}
                    strokeLinecap={cable.key === "review" ? "round" : undefined} aria-hidden="true"
                    className={`ws-cable-stroke ${cable.key === "review" ? "ws-return" : on(cable.stage - 1) ? "ws-cable-on" : "ws-cable"}`} />
                </g>
              ))}
            </g>

            {/* JE at the console */}
            <g className="ws-je" aria-hidden="true">
              <rect x="96" y="186" width="70" height="104" rx="6" className="ws-console" />
              <rect x="104" y="196" width="54" height="32" rx="3" className="ws-screen" />
              <text x="131" y="216" textAnchor="middle" className="ws-screen-text">{s.label.toUpperCase()}</text>
              <circle cx="131" cy="256" r="15" className="ws-dial" />
              <g style={{ transform: `rotate(${stage * 70 - 105}deg)`, transformOrigin: "131px 256px" }} className="ws-knob">
                <line x1="131" y1="256" x2="131" y2="245" strokeWidth="3" strokeLinecap="round" className="ws-knob-line" />
              </g>
              {/* figure */}
              <path d="M38 318 L44 236 Q46 214 68 212 L82 212 Q98 214 98 236 L102 318Z" className="ws-shirt" />
              <rect x="64" y="196" width="16" height="18" rx="5" className="ws-skin" />
              <ellipse cx="72" cy="180" rx="19" ry="22" className="ws-skin" />
              <path d="M52 178 Q50 152 74 152 Q96 152 92 176 Q86 164 72 166 Q60 166 52 178Z" className="ws-hair" />
              <circle cx="80" cy="182" r="1.8" className="ws-eye" />
              {/* arm reaching to the dial; tilts with the stage */}
              <g className="ws-arm" style={{ transform: `rotate(${(stage - 1.5) * 6}deg)`, transformOrigin: "86px 232px" }}>
                <path d="M86 232 Q104 244 118 252" strokeWidth="11" strokeLinecap="round" fill="none" className="ws-sleeve" />
                <circle cx="120" cy="253" r="6" className="ws-skin" />
              </g>
            </g>

            {/* READER: squat, wide visor, intake slot */}
            <g {...stageTarget(1, "Reader — select Read stage")} className={`ws-target ws-agent ${on(0) ? "is-on" : ""}`} data-testid="button-workshop-agent-read">
              <rect x="216" y="202" width="88" height="87" rx="16" className="ws-agent-hit" aria-hidden="true" />
              <rect x="208" y="324" width="104" height="32" rx="6" className="ws-agent-hit" aria-hidden="true" />
              <g className="bob b1" aria-hidden="true">
                <rect x="226" y="214" width="68" height="62" rx="14" className="ws-body" />
                <rect x="236" y="226" width="48" height="16" rx="8" className="ws-visor" />
                <rect x="246" y="230" width="28" height="8" rx="4" className="ws-eye-led blink" />
                <rect x="244" y="256" width="32" height="6" rx="3" className="ws-slot" />
                <rect x="240" y="276" width="10" height="12" rx="2" className="ws-body" /><rect x="270" y="276" width="10" height="12" rx="2" className="ws-body" />
              </g>
              <text x="260" y="344" textAnchor="middle" className="ws-tag" aria-hidden="true">READER</text>
            </g>

            {/* LINKER: tall, antennae joined by a graph */}
            <g {...stageTarget(2, "Linker — select Link stage")} className={`ws-target ws-agent ${on(1) ? "is-on" : ""}`} data-testid="button-workshop-agent-link">
              <rect x="360" y="138" width="80" height="151" rx="14" className="ws-agent-hit" aria-hidden="true" />
              <rect x="348" y="324" width="104" height="32" rx="6" className="ws-agent-hit" aria-hidden="true" />
              <g className="bob b2" aria-hidden="true">
                <path d="M384 196 L374 166 M416 196 L426 166" strokeWidth="3" className="ws-stroke" />
                <path d="M374 166 Q400 146 426 166" strokeWidth="2" fill="none" className="ws-stroke-accent" />
                <circle cx="374" cy="166" r="6" className="ws-node" /><circle cx="400" cy="152" r="5" className="ws-node" /><circle cx="426" cy="166" r="6" className="ws-node" />
                <rect x="372" y="194" width="56" height="84" rx="12" className="ws-body" />
                <circle cx="388" cy="218" r="6" className="ws-eye-led blink" /><circle cx="412" cy="218" r="6" className="ws-eye-led blink" />
                <path d="M386 244 H414 M386 254 H406" strokeWidth="3" strokeLinecap="round" className="ws-stroke-soft" />
              </g>
              <text x="400" y="344" textAnchor="middle" className="ws-tag" aria-hidden="true">LINKER</text>
            </g>

            {/* CHECKER: round, one lens eye, a review flag */}
            <g {...stageTarget(3, "Checker — select Check stage")} className={`ws-target ws-agent ${on(2) ? "is-on" : ""}`} data-testid="button-workshop-agent-check">
              <path d="M492 289 V184 H562 V154 H610 V194 H588 V289Z" className="ws-agent-hit" aria-hidden="true" />
              <rect x="488" y="324" width="104" height="32" rx="6" className="ws-agent-hit" aria-hidden="true" />
              <g className="bob b3" aria-hidden="true">
                <circle cx="540" cy="236" r="40" className="ws-body" />
                <circle cx="540" cy="230" r="15" className="ws-visor" />
                <circle cx="540" cy="230" r="8" className="ws-eye-led blink" />
                <line x1="551" y1="241" x2="562" y2="252" strokeWidth="4" strokeLinecap="round" className="ws-stroke" />
                <g className="ws-flag">
                  <line x1="574" y1="214" x2="574" y2="166" strokeWidth="3" className="ws-stroke" />
                  <path d="M574 166 L604 174 L574 184Z" className="ws-fill-accent" />
                </g>
                <rect x="526" y="272" width="10" height="16" rx="2" className="ws-body" /><rect x="546" y="272" width="10" height="16" rx="2" className="ws-body" />
              </g>
              <text x="540" y="344" textAnchor="middle" className="ws-tag" aria-hidden="true">CHECKER</text>
            </g>
          </svg>
        </div>

        <div className="workshop-controls flex flex-col gap-6 border-t border-foreground/10 p-5 md:border-l md:border-t-0 md:p-7">
          <fieldset>
            <legend className="font-mono text-[11px] uppercase tracking-[.2em] text-primary">Turn Je's dial</legend>
            {/* WebKit can clear :focus-visible after native radio arrow changes.
                Keep the visible label outlined whenever its hidden input has focus. */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {STAGES.map((st, i) => (
                <label key={st.k} className={`ws-stage-choice font-mono tracking-wider transition-colors uppercase ${i === stage ? "border-foreground bg-foreground text-background" : "border-foreground/25 hover:border-foreground"}`}>
                  <input type="radio" name={`${uid}stage`} value={st.k} checked={i === stage} onChange={() => setStage(i)} className="sr-only" data-testid={`radio-workshop-${st.k}`} />
                  <span aria-hidden className="text-[10px] opacity-60">{String(i + 1).padStart(2, "0")}</span>{st.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <button type="button" role="switch" aria-checked={review} onClick={() => setReview(!review)} data-testid="switch-workshop-review"
              className="flex min-h-11 w-full items-center justify-between gap-4 rounded-xl border border-foreground/20 px-4 text-left transition-colors hover:border-foreground">
              <span className="font-mono text-[12px] uppercase tracking-wider">Human review</span>
              <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${review ? "bg-primary" : "bg-foreground/25"}`} aria-hidden>
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-background transition-transform ${review ? "translate-x-6" : "translate-x-1"}`} />
              </span>
            </button>
          </div>

          <div id={`${uid}explain`} aria-live="polite" aria-atomic="true" className="min-h-[11rem]" data-testid="text-workshop-explain">
            <p className="font-display text-2xl font-bold">{s.agent >= 0 ? AGENTS[s.agent] : "Je, at the console"}</p>
            <p className="mt-2 leading-relaxed text-foreground/80">{s.text}</p>
            {s.k === "check" && <p className="mt-3 border-l-2 border-accent pl-3 text-sm leading-relaxed text-foreground/80">{reviewNote}</p>}
          </div>
          <p className="mt-auto font-mono text-[10px] uppercase leading-relaxed tracking-widest text-muted-foreground">An interactive sketch of agent roles—not the startup's actual architecture or a live system.</p>
        </div>
      </div>
    </figure>
  );
}
