import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import tukTuk from "../../assets/blog/adios-tuk-tuk.webp";
import van from "../../assets/blog/adios-van.webp";
import "./precache-demos.css";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  return reduced;
}

function Arrow({ className = "" }: { className?: string }) {
  return <svg className={className} width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 9h11m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function DemoFrame({ number, title, children, caption, testId, frameRef }: { number: string; title: string; children: ReactNode; caption: string; testId: string; frameRef?: RefObject<HTMLElement | null> }) {
  return <figure className="pc-demo" data-testid={testId} ref={frameRef}>
    <figcaption className="pc-demo-heading"><span className="pc-demo-index">{number}</span><span>{title}</span><span className="pc-demo-kind">interactive model</span></figcaption>
    {children}
    <div className="pc-demo-caption">{caption}</div>
  </figure>;
}

/** One payload travels along its own lane. No ambient or looping animation. */
function Packet({ path, duration, label, reduced, color = "#93c5fd" }: { path: string; duration: number; label?: string; reduced: boolean; color?: string }) {
  if (reduced) return null;
  return <g className="pc-svg-packet" style={{ color }}>
    {label ? <><rect x="-15" y="-10" width="30" height="20" rx="2" fill="#19273b" stroke="currentColor" /><text x="0" y="3.5" textAnchor="middle" fill="currentColor" fontSize="9" fontFamily="monospace">{label}</text></> : <><circle r="7" fill="currentColor" fillOpacity=".12" /><circle r="3" fill="currentColor" /></>}
    <animateMotion path={path} dur={`${duration}s`} fill="freeze" />
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.05;.85;1" dur={`${duration}s`} fill="freeze" />
  </g>;
}

function ColdStartRoutes({ phase, playing, mode, offline, run, reduced }: { phase: number; playing: boolean; mode: string; offline: boolean; run: number; reduced: boolean }) {
  const localPath = "M130 28 H314 Q340 28 340 48 V54 H600";
  const remotePath = offline ? "M130 90 H348" : "M130 90 H494 Q520 90 520 64 V54 H600";
  const visible = phase > 0 && (mode === "seed" || (phase === 3 && !offline));
  return <div className={`pc-request-map ${playing ? "pc-request-map-running" : ""}`}>
    <svg className="pc-request-map-wide" viewBox="0 0 730 122" aria-hidden="true" key={run}>
      <path className={`pc-data-route ${mode !== "seed" ? "pc-data-route-disabled" : ""}`} d={localPath} />
      <path className={`pc-data-route pc-data-route-network ${offline && phase === 3 ? "pc-data-route-failed" : ""}`} d="M130 90 H494 Q520 90 520 64 V54 H600" />
      <rect className={`pc-route-node ${mode === "seed" ? "pc-route-node-local" : ""}`} x="12" y="9" width="118" height="38" />
      <text className="pc-route-node-label" x="71" y="32" textAnchor="middle">BUNDLED LIST</text>
      <rect className="pc-route-node" x="12" y="71" width="118" height="38" />
      <text className="pc-route-node-label" x="71" y="94" textAnchor="middle">SERVER</text>
      <rect className={`pc-route-node ${visible ? "pc-route-node-live" : ""}`} x="600" y="32" width="118" height="44" />
      <text className="pc-route-node-label" x="659" y="50" textAnchor="middle">FIRST USEFUL UI</text>
      <text className="pc-route-result" x="659" y="65" textAnchor="middle">{visible ? "can paint" : "waiting"}</text>
      <text className="pc-route-annotation" x="195" y="17">{mode === "seed" ? "local read · no request" : "no local starting point"}</text>
      <text className="pc-route-annotation" x="210" y="112">{offline && phase === 3 ? "connection failed · no accepted result" : "background refresh · the slow path"}</text>
      {offline && phase === 3 && <g className="pc-route-cross"><path d="m360 84 12 12m0-12-12 12" /><text x="387" y="94">timeout</text></g>}
      {playing && mode === "seed" && <Packet path={localPath} duration={.35} label="[ ]" reduced={reduced} />}
      {playing && <Packet path={remotePath} duration={2.35} label={offline ? "?" : "[ ]"} color={offline ? "#d6b28d" : "#93c5fd"} reduced={reduced} />}
      {phase === 3 && !offline && <circle className="pc-route-arrival" cx="600" cy="54" r="12" />}
    </svg>
    <svg className="pc-request-map-small" viewBox="0 0 280 142" aria-hidden="true" key={`mobile-${run}`}>
      <path className={`pc-data-route ${mode !== "seed" ? "pc-data-route-disabled" : ""}`} d="M96 27H128Q140 27 140 40V58Q140 70 152 70H184" />
      <path className={`pc-data-route pc-data-route-network ${offline && phase === 3 ? "pc-data-route-failed" : ""}`} d="M96 107H128Q140 107 140 94V82Q140 70 152 70H184" />
      <rect className={`pc-route-node ${mode === "seed" ? "pc-route-node-local" : ""}`} x="10" y="12" width="86" height="30" />
      <text className="pc-route-node-label" x="53" y="31" textAnchor="middle">BUNDLE</text>
      <rect className="pc-route-node" x="10" y="92" width="86" height="30" />
      <text className="pc-route-node-label" x="53" y="111" textAnchor="middle">SERVER</text>
      <rect className={`pc-route-node ${visible ? "pc-route-node-live" : ""}`} x="184" y="49" width="86" height="42" />
      <text className="pc-route-node-label" x="227" y="66" textAnchor="middle">UI SNAPSHOT</text>
      <text className="pc-route-result" x="227" y="81" textAnchor="middle">{visible ? "can paint" : "waiting"}</text>
      {playing && mode === "seed" && <Packet path="M96 27H128Q140 27 140 40V58Q140 70 152 70H184" duration={.35} reduced={reduced} />}
      {playing && <Packet path={offline ? "M96 107H128" : "M96 107H128Q140 107 140 94V82Q140 70 152 70H184"} duration={2.35} reduced={reduced} color={offline ? "#d6b28d" : "#93c5fd"} />}
      {offline && phase === 3 && <g className="pc-route-cross"><path d="m128 102 10 10m0-10-10 10" /></g>}
    </svg>
    <div className="pc-request-map-legend"><span><i />Local data can unblock the screen.</span><span>The network still checks what changed.</span></div>
  </div>;
}

export function ColdStartDemo() {
  const [mode, setMode] = useState<"network" | "seed">("seed");
  const [offline, setOffline] = useState(false);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [run, setRun] = useState(0);
  const reduced = useReducedMotion();
  const frameRef = useRef<HTMLElement | null>(null);
  const autoPlayed = useRef(false);
  const interacted = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!frameRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .45) && !autoPlayed.current && !interacted.current) {
        autoPlayed.current = true;
        setPhase(0);
        setRun(r => r + 1);
        setPlaying(true);
        observer.disconnect();
      }
    }, { threshold: .45 });
    observer.observe(frameRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!playing) return;
    if (phase >= 3) { setPlaying(false); return; }
    timer.current = setTimeout(() => setPhase(p => p + 1), phase === 0 ? 350 : 1000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [phase, playing]);
  const reset = () => { interacted.current = true; if (timer.current) clearTimeout(timer.current); setPlaying(false); setPhase(0); };
  const ready = phase > 0 && (mode === "seed" || (phase === 3 && !offline));
  const refreshed = phase === 3 && !offline;
  const waiting = phase > 0 && phase < 3;
  const status = phase === 0 ? "Ready to open" : phase === 3 ? offline ? mode === "seed" ? "Still useful. Still offline." : "No connection. No catalogue." : "Server response accepted" : mode === "seed" ? "Local list visible · refreshing" : "Waiting for the network";
  return <DemoFrame number="01" title="What does the first screen wait for?" caption="The seed example plays once on entry. This is a simplified timing model, not a recording or benchmark; the network is deliberately slowed so the dependency is visible." testId="cold-start-demo" frameRef={frameRef}>
    <div className="pc-controls">
      <div className="pc-segment" role="group" aria-label="Catalogue strategy">
        <button type="button" aria-pressed={mode === "network"} onClick={() => { reset(); setMode("network"); }}>Network first</button>
        <button type="button" aria-pressed={mode === "seed"} onClick={() => { reset(); setMode("seed"); }}>Bundled seed</button>
      </div>
      <label className="pc-switch"><input type="checkbox" checked={offline} onChange={e => { reset(); setOffline(e.target.checked); }} /><span>Go offline</span></label>
    </div>
    <ColdStartRoutes phase={phase} playing={playing} mode={mode} offline={offline} run={run} reduced={reduced} />
    <div className={`pc-cold-stage pc-cold-phase-${phase}`}>
      <div className={`pc-phone ${ready ? "pc-phone-live" : ""}`}>
        <div className="pc-phone-top"><span>adios</span><span className="pc-phone-dots" aria-hidden="true">•••</span></div>
        <div className="pc-phone-content"><span className="pc-eyebrow">VEHICLE TYPES · EXAMPLE</span><strong>Browse the catalogue.</strong>
          <div className={`pc-phone-catalogue ${ready ? "pc-is-ready" : ""}`}>
            {ready ? <><div className="pc-vehicle-tile"><img src={tukTuk.src} width="256" height="256" alt="" /><span>Tuk Tuk</span><small>reference data</small></div><div className="pc-vehicle-tile"><img src={van.src} width="256" height="256" alt="" /><span>Van</span><small>reference data</small></div></> : <><div className="pc-placeholder"><span /><span /><span /></div><div className="pc-placeholder"><span /><span /><span /></div><span className="pc-empty-label">{phase === 0 ? "The screen has not opened yet" : offline && phase === 3 ? "A list needs a successful response" : "Waiting for catalogue data…"}</span></>}
          </div>
          <span className={`pc-source-label ${ready ? "pc-source-available" : ""}`}>{ready ? refreshed ? "● NETWORK · validated" : "● BUNDLE · available immediately" : "○ No catalogue available"}</span>
        </div>
      </div>
      <div className="pc-cold-explanation">
        <div className="pc-timeline">
          {[{ label: "Open screen", text: "The user arrives." }, { label: mode === "seed" ? "Read local seed" : "Send request", text: mode === "seed" ? "The UI already has a list." : "The UI depends on a response." }, { label: "Network in flight", text: mode === "seed" ? "Refresh runs alongside the UI." : "The list is still unavailable." }, { label: offline ? "Connection fails" : "Validate response", text: offline ? mode === "seed" ? "Keep the last allowed snapshot." : "There is no local fallback." : "Accept the server’s current list." }].map((step, i) => <div key={`${mode}-${i}`} className={`pc-timeline-step ${(i === 2 ? phase >= 1 : phase >= i) ? "pc-step-active" : ""} ${phase === i ? "pc-step-current" : ""}`}><span className="pc-step-dot" /><div><b>{step.label}</b><small>{step.text}</small></div></div>)}
        </div>
        <p className="pc-live-status" role="status" aria-live="polite">{status}</p>
        <div className="pc-actions"><button className="pc-primary-button" type="button" onClick={() => { interacted.current = true; setPhase(0); setRun(r => r + 1); setPlaying(true); }} disabled={playing}><span aria-hidden="true">{waiting ? "···" : "▷"}</span> {playing ? "Opening…" : phase === 3 ? "Replay opening" : "Open the screen"}</button><button className="pc-text-button" type="button" onClick={reset}>Reset</button></div>
      </div>
    </div>
  </DemoFrame>;
}

type Scenario = "launch" | "updated" | "offline" | "revoked" | "partner";
const scenarios: Record<Scenario, { label: string; initial: string; result: string; detail: string; network: string; source: string }> = {
  launch: { label: "First launch", initial: "Bundled catalogue", result: "Validated catalogue", detail: "The seed can paint first. A compatible, newer disk snapshot may replace it; the network request does not wait for disk hydration.", network: "200 · same content", source: "Same list · newer validation time" },
  updated: { label: "New content", initial: "Last good catalogue", result: "Updated catalogue", detail: "A valid response replaces the entire list. An empty list is also a successful result; old entries are not merged back in.", network: "200 · new content", source: "New list · accepted response" },
  offline: { label: "Offline", initial: "Last good catalogue", result: "Last good catalogue", detail: "A transient failure keeps the last allowed snapshot. Its successful-validation time does not move forward.", network: "Timeout · refresh failed", source: "Existing list · refresh error" },
  revoked: { label: "Access revoked", initial: "Last good catalogue", result: "Catalogue cleared", detail: "FEATURE_DISABLED or a 4xx response other than 408/429 clears usable data and the public disk entry. Access rules take priority over fallback.", network: "403 · access denied", source: "No fallback · resource cleared" },
  partner: { label: "Partner context", initial: "No public fallback", result: "Partner catalogue", detail: "Public seeds and public disk records cannot populate this context. The accepted partner result stays in that context’s memory; late public results are discarded.", network: "200 · partner response", source: "Partner memory · isolated context" },
};

function SnapshotRoutes({ partner, sending, complete, failed, reduced }: { partner: boolean; sending: boolean; complete: boolean; failed: boolean; reduced: boolean }) {
  const bundle = "M0 33 H20 Q42 33 42 55 V85 Q42 107 64 107 H84";
  const disk = "M0 107 H84";
  const network = failed ? "M0 181 H28 Q42 181 42 167" : "M0 181 H20 Q42 181 42 159 V129 Q42 107 64 107 H84";
  return <div className="pc-flow-routes" aria-hidden="true">
    <svg viewBox="0 0 84 214" preserveAspectRatio="none">
      <path className={`pc-snapshot-route ${partner ? "pc-snapshot-route-blocked" : ""}`} d={bundle} />
      <path className={`pc-snapshot-route ${partner ? "pc-snapshot-route-blocked" : ""}`} d={disk} />
      <path className={`pc-snapshot-route ${complete && failed ? "pc-snapshot-route-error" : ""}`} d="M0 181 H20 Q42 181 42 159 V129 Q42 107 64 107 H84" />
      {partner && <g className="pc-route-cross"><path d="m19 27 10 10m0-10L19 37M19 102l10 10m0-10-10 10" /></g>}
      {sending && <Packet path={network} duration={.65} reduced={reduced} color={failed ? "#d6b28d" : "#93c5fd"} />}
      {complete && !failed && <circle className="pc-route-arrival" cx="82" cy="107" r="8" />}
    </svg>
    <span className="pc-mobile-route"><svg viewBox="0 0 84 42"><path d="M42 1V39m-4-4 4 4 4-4" stroke="#665374" fill="none" />{sending && <Packet path="M42 1V39" duration={.65} reduced={reduced} color={failed ? "#d6b28d" : "#93c5fd"} />}</svg></span>
  </div>;
}

export function SnapshotFlowDemo() {
  const [scenario, setScenario] = useState<Scenario>("launch");
  const [phase, setPhase] = useState<"idle" | "sending" | "clearing" | "complete">("idle");
  const reduced = useReducedMotion();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const reset = () => { if (timer.current) clearTimeout(timer.current); setPhase("idle"); };
  const apply = () => {
    if (phase === "complete") { reset(); return; }
    setPhase("sending");
    timer.current = setTimeout(() => {
      if (scenario === "revoked" && !reduced) {
        setPhase("clearing");
        timer.current = setTimeout(() => setPhase("complete"), 350);
      } else setPhase("complete");
    }, reduced ? 0 : 700);
  };
  const current = scenarios[scenario];
  const complete = phase === "complete";
  const sending = phase === "sending" || phase === "clearing";
  const publicAllowed = scenario !== "partner";
  const clear = scenario === "revoked" && complete;
  const rowNames = !publicAllowed ? complete ? ["Partner type A", "Partner type B"] : [] : clear ? [] : complete && scenario === "updated" ? ["Tuk Tuk", "Van", "New category"] : ["Tuk Tuk", "Van"];
  const changed = scenario === "updated" || scenario === "partner";
  return <DemoFrame number="02" title="Follow the snapshot, not just the request." caption="Choose an event, then apply its result. The moving payload shows which result may reach the UI. Category rows are illustrative, not a live catalogue." testId="snapshot-flow-demo">
    <div className="pc-controls pc-flow-controls" role="group" aria-label="Snapshot scenario">{(Object.keys(scenarios) as Scenario[]).map(id => <button className="pc-scenario-button" key={id} type="button" aria-pressed={scenario === id} onClick={() => { reset(); setScenario(id); }}>{scenarios[id].label}</button>)}</div>
    <div className={`pc-flow-stage ${complete ? "pc-flow-complete" : ""} ${sending ? "pc-flow-sending" : ""} ${!publicAllowed ? "pc-flow-partner" : ""}`} key={scenario}>
      <div className="pc-flow-inputs">
        <div className={`pc-flow-source ${!publicAllowed || clear ? "pc-flow-disabled" : ""}`}><span className="pc-node-icon" aria-hidden="true">◇</span><div><b>Bundled seed</b><small>{publicAllowed ? "Ships with the application" : "Excluded from this context"}</small></div></div>
        <div className={`pc-flow-source ${!publicAllowed || clear ? "pc-flow-disabled" : ""}`}><span className="pc-node-icon" aria-hidden="true">▤</span><div><b>Public disk</b><small>{clear ? "Public entry removed" : publicAllowed ? "Optional · compatible + newer" : "Excluded from this context"}</small></div></div>
        <div className={`pc-flow-source pc-flow-network ${complete ? "pc-flow-network-done" : ""} ${complete && (scenario === "revoked" || scenario === "offline") ? "pc-flow-failed" : ""}`}><span className="pc-node-icon" aria-hidden="true">↗</span><div><b>Network</b><small>{sending ? "Result arriving…" : complete ? current.network : "An independent background attempt"}</small></div></div>
      </div>
      <SnapshotRoutes partner={!publicAllowed} sending={sending} complete={complete} failed={scenario === "offline"} reduced={reduced} />
      <div className={`pc-flow-ui ${clear ? "pc-flow-cleared" : ""} ${phase === "clearing" ? "pc-flow-revoking" : ""}`}>
        <span className="pc-eyebrow">UI SNAPSHOT</span>
        <div className="pc-catalogue-rows" aria-label="Illustrative catalogue rows">
          {rowNames.length ? rowNames.map((name, i) => <div className={`pc-catalogue-row ${complete && changed ? "pc-catalogue-row-new" : ""}`} key={name} style={{ "--pc-row": i } as CSSProperties}><span className="pc-row-record" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span><span>{name}</span><span className="pc-row-check" aria-hidden="true">{complete && scenario === "launch" ? "✓" : "·"}</span></div>) : <div className="pc-catalogue-empty"><span aria-hidden="true">{clear ? "∅" : "—"}</span><span>{clear ? "No usable records" : "Public data stays outside"}</span></div>}
        </div>
        <strong key={`${scenario}-${complete}`}>{complete ? current.result : current.initial}</strong>
        <small>{sending ? "Validating before acceptance…" : complete ? current.source : publicAllowed ? "Readable while refresh runs" : "Waiting for an allowed response"}</small>
      </div>
    </div>
    <div className="pc-flow-summary"><p role="status" aria-live="polite">{current.detail}</p><button type="button" className="pc-primary-button" onClick={apply} disabled={sending}>{sending ? "Applying…" : complete ? "Reset event" : "Apply network result"}<Arrow /></button></div>
  </DemoFrame>;
}

/** A tiled SVG mask makes the pixels appear in decode order, using the real asset. */
function DecodeImage({ decoding, decoded, run }: { decoding: boolean; decoded: boolean; run: number }) {
  const maskId = useId().replace(/:/g, "");
  return <svg className={`pc-decode-image ${decoding ? "pc-decoding" : ""} ${decoded ? "pc-decoded" : ""}`} viewBox="0 0 256 256" aria-hidden="true" key={run}>
    <defs><mask id={maskId}><rect width="256" height="256" fill={decoded ? "white" : "black"} />{decoding && Array.from({ length: 144 }, (_, i) => <rect key={i} className="pc-decode-cell" x={(i % 12) * (256 / 12)} y={Math.floor(i / 12) * (256 / 12)} width="22" height="22" fill="white" style={{ "--pc-cell-delay": `${Math.floor(i / 12) * .05 + (i % 12) * .014}s` } as CSSProperties} />)}</mask></defs>
    <image href={tukTuk.src} width="256" height="256" opacity=".08" />
    <image href={tukTuk.src} width="256" height="256" mask={`url(#${maskId})`} />
    {!decoded && <path d={Array.from({ length: 13 }, (_, i) => `M${i * (256 / 12)} 0V256M0 ${i * (256 / 12)}H256`).join("")} stroke="#5c6b85" strokeOpacity=".19" strokeWidth="1" />}
    {decoding && <rect className="pc-decode-scan" width="256" height="2" fill="#93c5fd" />}
  </svg>;
}

function ImageTransfer({ painted, reduced }: { painted: boolean; reduced: boolean }) {
  return <span className={`pc-image-transfer ${painted ? "pc-transfer-painted" : ""}`} aria-hidden="true"><svg viewBox="0 0 60 90"><path d="M0 45H60" stroke="#3b3440" fill="none" /><path d="m52 40 6 5-6 5" stroke="#85728f" fill="none" />{painted && !reduced && <g><rect x="-13" y="-13" width="26" height="26" fill="#19273b" stroke="#93c5fd" /><image x="-12" y="-12" href={tukTuk.src} width="24" height="24" /><animateMotion path="M0 45H60" dur=".32s" fill="freeze" /><animate attributeName="opacity" values="1;1;0" keyTimes="0;.8;1" dur=".32s" fill="freeze" /></g>}</svg></span>;
}

export function ImagePipelineDemo() {
  const [warm, setWarm] = useState(false);
  const [opened, setOpened] = useState(false);
  const [decoded, setDecoded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [run, setRun] = useState(0);
  const reduced = useReducedMotion();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const reset = () => { if (timer.current) clearTimeout(timer.current); setWarm(false); setOpened(false); setDecoded(false); setBusy(false); setRun(r => r + 1); };
  const prepare = () => { setBusy(true); setRun(r => r + 1); timer.current = setTimeout(() => { setWarm(true); setDecoded(true); setBusy(false); }, reduced ? 0 : 850); };
  const open = () => { setOpened(true); if (!warm) { setRun(r => r + 1); timer.current = setTimeout(() => setDecoded(true), reduced ? 0 : 1100); } };
  const decoding = busy || (opened && !decoded);
  const painted = opened && decoded;
  const bytes = ["52", "49", "46", "46", "··", "··", "··", "··", "57", "45", "42", "50", "56", "50", "38", "58", "··", "··", "··", "··", "··", "··", "··", "··"];
  return <DemoFrame number="03" title="A file on disk is not a painted image." caption="The real bundled Tuk Tuk thumbnail, with a simulated decode delay. The tile-by-tile reveal explains the work; it does not depict Flutter’s decoder implementation or measure its speed." testId="image-pipeline-demo">
    <div className={`pc-image-stage ${decoding ? "pc-image-decoding" : ""} ${painted ? "pc-image-painted" : ""}`}><div className="pc-image-pipeline">
      <div className="pc-image-step pc-image-step-ready"><span className="pc-image-step-number">01</span><strong>Compressed bytes</strong><small>Already in the bundle</small><div className="pc-byte-file" aria-hidden="true"><span>RIFF · WEBP</span><div className="pc-hex-grid">{bytes.map((byte, i) => <i key={i} style={{ "--pc-byte": i } as CSSProperties}>{byte}</i>)}</div></div><span className="pc-stage-state">available</span></div>
      <span className={`pc-decode-transfer ${decoding ? "pc-decode-transfer-active" : ""}`} aria-hidden="true"><Arrow /><i /><i /><i /></span>
      <div className={`pc-image-step ${decoded ? "pc-image-step-ready" : ""}`}><span className="pc-image-step-number">02</span><strong>Decoded pixels</strong><small>Bounded to 256 × 256</small><div className="pc-raster-preview"><DecodeImage decoding={decoding} decoded={decoded} run={run} /></div><span className="pc-stage-state">{decoding ? "decoding pixels…" : decoded ? "in memory" : "not prepared yet"}</span></div>
      <ImageTransfer painted={painted} reduced={reduced} />
      <div className={`pc-image-step ${painted ? "pc-image-step-ready" : ""}`}><span className="pc-image-step-number">03</span><strong>Picker frame</strong><small>{opened ? "The user has tapped" : "Not opened yet"}</small><div className={`pc-picker-preview ${painted ? "pc-picker-painted" : ""}`} aria-hidden="true">{opened ? decoded ? <img src={tukTuk.src} width="256" height="256" alt="" /> : <span className="pc-static-fallback">◇</span> : <span className="pc-unopened">tap to open</span>}</div><span className="pc-stage-state">{opened ? decoded ? "thumbnail painted" : "static fallback" : "waiting for tap"}</span></div>
    </div><div className="pc-work-placement"><span>{warm ? "WORK FINISHED BEFORE THE TAP" : opened ? "THE TAP ALREADY HAPPENED" : "MOVE THE DECODE BEFORE THE TAP"}</span><div>{opened && !warm && <><span className="pc-work-tapped">user tap</span><b aria-hidden="true">→</b></>}<i className={decoding ? "pc-work-active" : decoded ? "pc-work-done" : ""} /><span>{warm ? "decoded memory" : decoded ? "decode finished" : "decode work"}</span>{(!opened || warm) && <><b aria-hidden="true">→</b><span className={opened ? "pc-work-tapped" : ""}>user tap</span></>}<b aria-hidden="true">→</b><span className={painted ? "pc-work-tapped" : ""}>paint</span></div></div></div>
    <div className="pc-image-bottom"><div className="pc-actions"><button className="pc-secondary-button" type="button" onClick={prepare} disabled={warm || busy || opened}>{busy ? "Preparing pixels…" : warm ? "✓ Image prepared" : "1. Prewarm image"}</button><button className="pc-primary-button" type="button" onClick={open} disabled={opened || busy}>2. Open picker<Arrow /></button><button className="pc-text-button" type="button" onClick={reset}>Reset</button></div><p role="status" aria-live="polite">{opened ? warm ? "The pixels were ready before the tap. The picker can paint the thumbnail straight away." : decoded ? "The thumbnail is now decoded. On this path, the work happened after the tap." : "The bytes are local, but decoding still takes work. A static fallback occupies the first frame." : warm ? "Preparation finished before the picker opened. Now try the second step." : "Try opening directly. Then reset, prewarm first, and compare the first frame."}</p></div>
  </DemoFrame>;
}
