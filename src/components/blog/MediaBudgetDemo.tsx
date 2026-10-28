import { useEffect, useRef, useState } from 'react';
import './media-budget.css';

const ORIGINAL = 32_817_179;
const PREPARED = 190_312;
const BLOCK = 65_536;
const COUNT = Math.ceil(ORIGINAL / BLOCK);

/** The squares encode recorded artifact bytes, never elapsed download time. */
export default function MediaBudgetDemo() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const current = useRef(0);
  const frame = useRef(0);
  const observer = useRef<ResizeObserver | null>(null);
  const [target, setTarget] = useState(0);
  const [running, setRunning] = useState(false);
  const [bytes, setBytes] = useState(ORIGINAL);
  const [replay, setReplay] = useState(0);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;
    let stamp = 0;
    const draw = (progress: number) => {
      const width = el.getBoundingClientRect().width;
      const height = width * 0.45;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (el.width !== Math.round(width * dpr) || el.height !== Math.round(height * dpr)) {
        el.width = Math.round(width * dpr);
        el.height = Math.round(height * dpr);
      }
      ctx.setTransform(el.width / 640, 0, 0, el.height / 288, 0, 0);
      ctx.clearRect(0, 0, 640, 288);
      const active = (ORIGINAL + (PREPARED - ORIGINAL) * progress) / BLOCK;
      for (let i = 0; i < COUNT; i++) {
        const x = 97 + (i % 32) * 14;
        const y = 27 + Math.floor(i / 32) * 14;
        ctx.strokeStyle = '#3b344052';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, 9, 9);
        const fill = Math.max(0, Math.min(1, active - i));
        if (fill > 0) {
          ctx.fillStyle = i < 3 ? '#93c5fd' : '#628ec5';
          ctx.fillRect(x, y, 9 * fill, 9);
        }
      }
      if (progress > 0.65) {
        ctx.globalAlpha = Math.min(1, (progress - 0.65) / 0.35);
        ctx.fillStyle = '#e5e4e7';
        ctx.font = '500 23px system-ui, sans-serif';
        ctx.fillText('Same 22 images.', 210, 115);
        ctx.fillStyle = '#93c5fd';
        ctx.fillText('99.4% fewer bytes.', 210, 150);
        ctx.globalAlpha = 1;
      }
      ctx.fillStyle = '#a49bab';
      ctx.font = '9px ui-monospace, monospace';
      ctx.fillText('01', 68, 36);
      ctx.fillText('32', 536, 36);
      ctx.fillText('64 KiB / square', 97, 271);
      ctx.fillText('partial squares are proportional', 341, 271);
    };
    const from = current.current;
    const duration = from === target || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1600;
    const start = performance.now();
    const animate = (now: number) => {
      const t = duration ? Math.min(1, (now - start) / duration) : 1;
      const eased = t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      const next = from + (target - from) * eased;
      current.current = next;
      draw(next);
      if (now - stamp > 60 || t === 1) {
        setBytes(Math.round(ORIGINAL + (PREPARED - ORIGINAL) * next));
        stamp = now;
      }
      if (t < 1) frame.current = requestAnimationFrame(animate);
      else setRunning(false);
    };
    frame.current = requestAnimationFrame(animate);
    observer.current = new ResizeObserver(() => draw(current.current));
    observer.current.observe(el);
    return () => { cancelAnimationFrame(frame.current); observer.current?.disconnect(); };
  }, [target, replay]);

  const compare = (next: number) => { if (next === target) return; setRunning(true); setTarget(next); };
  return <figure className="pc-budget" data-testid="media-budget-demo">
    <figcaption><span>04 / The cost of shipping the starting point</span><span>recorded artifact bytes</span></figcaption>
    <div className="pc-budget-toolbar">
      <div role="group" aria-label="Image artifact to visualize">
        <button type="button" aria-pressed={target === 0} disabled={running} onClick={() => compare(0)}>Original media</button>
        <button type="button" aria-pressed={target === 1} disabled={running} onClick={() => compare(1)}>Prepared thumbnails</button>
      </div>
      <span className="pc-budget-counter" aria-hidden="true">{bytes.toLocaleString('en-US')} <small>bytes</small></span>
    </div>
    <canvas ref={canvas} aria-hidden="true" />
    <div className="pc-budget-ledger">
      <div><span>Original PNGs + SVGs</span><strong>32,817,179 B</strong></div>
      <span aria-hidden="true">→</span>
      <div><span>Thumbnail WebPs + SVGs</span><strong>190,312 B</strong></div>
    </div>
    <div className="pc-budget-foot">
      <p>Each square represents 64 KiB. The animation visualizes the size difference between two recorded media snapshots; it does not simulate an encoder, a download, or a measured speedup.</p>
      <button type="button" disabled={running} onClick={() => { current.current = 0; setRunning(true); setTarget(1); setReplay(v => v + 1); }}>Replay reduction <span aria-hidden="true">↺</span></button>
    </div>
    <p className="pc-budget-sr" role="status">{!running ? target === 1 ? 'Prepared snapshot: 190,312 bundled image bytes, approximately 99.4 percent fewer than the original snapshot. Both contain 22 images.' : 'Original snapshot: 32,817,179 bundled image bytes across 22 images.' : ''}</p>
  </figure>;
}
