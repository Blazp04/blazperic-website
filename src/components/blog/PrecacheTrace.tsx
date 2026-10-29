import { useEffect, useState } from 'react';
import './precache-trace.css';

const events = [
  { from: 1, to: 2, label: 'seed', code: '_snapshot = compatibleSeed', detail: 'The controller starts with permitted bundled data.', state: 'seed', disk: 'not started', network: 'not started' },
  { from: 2, to: 0, label: 'snapshot', code: 'watch() → emit current snapshot', detail: 'The screen can read the current list before either asynchronous operation finishes.', state: 'seed', disk: 'not started', network: 'not started' },
  { from: 2, to: 3, label: 'read', code: 'hydrate(generation, networkVersion)', detail: 'Hydration captures the current context generation and accepted-network version.', state: 'seed', disk: 'reading…', network: 'not started' },
  { from: 2, to: 4, label: 'GET', code: 'refresh = fetch()', detail: 'The request starts independently of the disk read. Other consumers share this in-flight refresh.', state: 'seed', disk: 'reading…', network: 'in flight' },
  { from: 4, to: 2, label: 'valid response', code: 'acceptedNetworkVersion++; publish(data)', detail: 'The server result validates and becomes the current snapshot. Public data is queued for persistence.', state: 'network', disk: 'reading…', network: 'accepted' },
  { from: 2, to: 0, label: 'snapshot', code: 'updates.add(networkSnapshot)', detail: 'The same subscription receives the accepted update. The widget never chooses a data source.', state: 'network', disk: 'reading…', network: 'accepted' },
  { from: 3, to: 2, label: 'late disk result', code: 'capturedVersion != acceptedNetworkVersion → return', detail: 'The disk read finishes late. Its captured version is obsolete, so it cannot overwrite the network answer.', state: 'network', disk: 'discarded', network: 'accepted' },
];
const lanes = ['UI', 'Bundle', 'Controller', 'Hive', 'API'];
export default function PrecacheTrace() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    if (step === events.length - 1) { setPlaying(false); return; }
    const timer = setTimeout(() => setStep(s => s + 1), 1700);
    return () => clearTimeout(timer);
  }, [playing, step]);
  const active = events[step];
  return <figure className="pc-trace" data-testid="precache-trace">
    <figcaption>A startup trace: the API answers before Hive</figcaption>
    <div className="pc-trace-scroll" tabIndex={0} aria-label="Scrollable sequence diagram">
      <svg viewBox="0 0 680 380" role="img" aria-label={`Step ${step + 1}: ${active.detail}`}>
        {lanes.map((name, i) => <g key={name}><text x={65 + i * 137} y="26" textAnchor="middle" className={i === 2 ? 'trace-owner' : ''}>{name}</text><path d={`M${65 + i * 137} 42 V368`} className="trace-lane" /></g>)}
        {events.map((event, i) => {
          const start = 65 + event.from * 137; const end = 65 + event.to * 137; const y = 70 + i * 45; const right = end > start;
          return <g key={i} className={`${i === step ? 'trace-active' : ''} ${i > step ? 'trace-future' : ''}`}>
            <path key={`${i}-${i === step}`} className={`trace-message ${i === step ? 'trace-draw' : ''} ${i === 6 ? 'trace-rejected' : ''}`} pathLength="1" d={`M${start} ${y} H${end}`} />
            <path className={i === 6 ? 'trace-rejected' : 'trace-message'} d={`M${end + (right ? -5 : 5)} ${y - 4} L${end} ${y} L${end + (right ? -5 : 5)} ${y + 4}`} />
            <text x={(start + end) / 2} y={y - 8} textAnchor="middle">{event.label}</text>
            {i === 6 && <text x={end - 14} y={y + 18} className="trace-rejection-label">discard</text>}
          </g>;
        })}
      </svg>
    </div>
    <div className="pc-trace-controls"><button type="button" onClick={() => { if (step === events.length - 1) setStep(0); setPlaying(p => !p); }}>{playing ? 'Pause' : 'Play trace'}</button><button type="button" disabled={step === 0} onClick={() => { setPlaying(false); setStep(s => s - 1); }}>Previous</button><button type="button" disabled={step === events.length - 1} onClick={() => { setPlaying(false); setStep(s => s + 1); }}>Next event</button><span>{step + 1} / {events.length}</span></div>
    <div className="pc-trace-explanation" aria-live="polite"><code>{active.code}</code><p>{active.detail}</p></div>
    <dl className="pc-trace-state"><div><dt>UI data</dt><dd>{active.state}</dd></div><div><dt>Disk read</dt><dd>{active.disk}</dd></div><div><dt>Refresh</dt><dd>{active.network}</dd></div></dl>
    <p className="pc-trace-footnote">Step through the order of events. Playback speed is illustrative; this is not a latency measurement. The persistence write after acceptance is omitted to keep the read race visible.</p>
  </figure>;
}
