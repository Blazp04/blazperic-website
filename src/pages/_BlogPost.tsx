import { useState, useRef, useEffect, useCallback } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";

/* ═══════════════════════════════════════════════════════
   REUSABLE PIECES
   ═══════════════════════════════════════════════════════ */

function BlogNav() {
    return (
        <nav className="wrapper border-b border-nickel">
            <div className="flex items-center justify-between px-5 sm:px-10 py-4">
                <a href="/" className="flex items-center gap-3 text-white no-underline group">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="none" className="text-grey group-hover:text-ruby transition-colors">
                        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-mono text-xs text-grey group-hover:text-white transition-colors">cd ~</span>
                </a>
                <span className="text-grey/40 text-xs font-mono hidden sm:block">blazperic.com / blog / particle-systems</span>
            </div>
        </nav>
    );
}

function SectionHeading({ number, title, subtitle }: { number: string; title: string; subtitle?: string }) {
    return (
        <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
                <span className="text-ruby font-mono text-xs tracking-widest">{number}</span>
                <span className="flex-1 h-px bg-nickel" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-medium text-white mb-2">{title}</h2>
            {subtitle && <p className="text-grey text-sm">{subtitle}</p>}
        </div>
    );
}

function Note({ children, type = "info" }: { children: React.ReactNode; type?: "info" | "physics" | "tip" }) {
    const styles = {
        info: { border: "var(--color-ruby)", bg: "rgba(59,130,246,0.06)", icon: "i", color: "#3B82F6" },
        physics: { border: "#FBBF24", bg: "rgba(251,191,36,0.06)", icon: "", color: "#FBBF24" },
        tip: { border: "#60A5FA", bg: "rgba(96,165,250,0.06)", icon: "", color: "#60A5FA" },
    }[type];
    return (
        <div className="my-6 flex gap-3" style={{ borderLeft: `3px solid ${styles.border}`, background: styles.bg, padding: "1rem 1.25rem" }}>
            <span className="font-mono text-sm shrink-0" style={{ color: styles.color }}>{styles.icon}</span>
            <div className="text-sm text-grey leading-relaxed">{children}</div>
        </div>
    );
}

function Equation({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="my-6 border border-nickel/60 flex flex-col sm:flex-row">
            <div className="px-4 py-3 border-b sm:border-b-0 sm:border-r border-nickel/60 flex items-center justify-center min-w-[120px]"
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <span className="text-[10px] font-mono text-grey/50 tracking-widest uppercase">{label}</span>
            </div>
            <div className="px-6 py-4 font-mono text-sm text-white flex items-center gap-2 flex-wrap">
                {children}
            </div>
        </div>
    );
}

/* ── Diff-style code block ──────────────────────────── */
function DiffBlock({ code, title }: { code: string; title?: string }) {
    const [open, setOpen] = useState(false);
    const tokenize = (src: string) => {
        const tokens: { type: string; value: string }[] = [];
        const re = /\/\/[^\n]*|\/\*[\s\S]*?\*\/|'[^']*'|"[^"]*"|`[^`]*`|\b(const|let|var|function|return|if|else|for|while|new|this|true|false|null|undefined|class|extends|import|export|default|typeof|instanceof|void|in|of|switch|case|break|continue|try|catch|finally|throw|yield|async|await)\b|\b\d+(?:\.\d+)?\b|[a-zA-Z_$][\w$]*(?=\s*\()|[a-zA-Z_$][\w$]*(?=\s*=)|\.([a-zA-Z_$][\w$]*)|[a-zA-Z_$][\w$]*|[{}()\[\];,=+\-*/<>!&|?:.]/g;
        let last = 0;
        let m: RegExpExecArray | null;
        while ((m = re.exec(src)) !== null) {
            if (m.index > last) tokens.push({ type: "plain", value: src.slice(last, m.index) });
            const v = m[0];
            let type = "plain";
            if (v.startsWith("//") || v.startsWith("/*")) type = "comment";
            else if (v.startsWith("'") || v.startsWith('"') || v.startsWith("`")) type = "string";
            else if (m[1]) type = "keyword";
            else if (/^\d/.test(v)) type = "number";
            else if (/^[a-zA-Z_$]/.test(v) && src[re.lastIndex] === "(") type = "function";
            else if (m[2]) type = "property";
            else if (/^[{}()\[\];,=+\-*/<>!&|?:.]$/.test(v)) type = "punctuation";
            tokens.push({ type, value: v });
            last = re.lastIndex;
        }
        if (last < src.length) tokens.push({ type: "plain", value: src.slice(last) });
        return tokens;
    };

    const colors: Record<string, string> = {
        comment: "#6b7280", keyword: "#c084fc", string: "#86efac", number: "#FBBF24",
        function: "#3B82F6", property: "#93c5fd", punctuation: "#6b7280", plain: "#d4d4d8",
    };

    const lines = code.split("\n");

    const added = lines.filter(l => l.startsWith("+")).length;

    return (
        <div className="my-8 border border-nickel overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full px-4 py-2.5 border-b border-nickel flex items-center gap-3 cursor-pointer"
                style={{ background: "rgba(255,255,255,0.02)" }}
            >
                <span className="text-[10px] font-mono text-grey/50 tracking-widest uppercase">
                    diff{title ? ` · ${title}` : ""}
                </span>
                <span className="flex items-center gap-3 ml-auto">
                    <span className="flex items-center gap-1.5 text-[10px] font-mono">
                        <span className="w-2 h-2" style={{ background: "rgba(52,211,153,0.3)" }} />
                        <span className="text-emerald-400/60">+{added} lines</span>
                    </span>
                    <span className="text-[10px] font-mono text-grey/30">{open ? "hide" : "show"}</span>
                </span>
            </button>
            {open && (
                <pre className="text-[12px] leading-relaxed font-mono overflow-x-auto m-0" style={{ background: "rgba(0,0,0,0.2)" }}>
                    {lines.map((line, i) => {
                        const isAdded = line.startsWith("+");
                        const displayLine = isAdded ? line.slice(1) : line;
                        const tokens = tokenize(displayLine);
                        return (
                            <div key={i} className="flex" style={{
                                background: isAdded ? "rgba(52,211,153,0.06)" : "transparent",
                            }}>
                                <span className="select-none w-5 shrink-0 text-right pr-1 mr-3 text-[10px] leading-relaxed" style={{
                                    color: isAdded ? "#34d399" : "transparent",
                                    borderRight: isAdded ? "2px solid rgba(52,211,153,0.4)" : "2px solid transparent",
                                }}>{isAdded ? "+" : " "}</span>
                                <span style={{ opacity: isAdded ? 1 : 0.5 }}>
                                    {tokens.map((t, j) => (
                                        <span key={j} style={{ color: colors[t.type] || colors.plain }}>{t.value}</span>
                                    ))}
                                </span>
                            </div>
                        );
                    })}
                </pre>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   INTERACTIVE DEMOS
   ═══════════════════════════════════════════════════════ */

/* ── Demo 1a: Static Ball ───────────────────────────── */
function StaticBallDemo() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        const dpr = window.devicePixelRatio || 1;

        const resize = () => {
            const r = canvas.getBoundingClientRect();
            canvas.width = r.width * dpr;
            canvas.height = r.height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();

        const r = canvas.getBoundingClientRect();
        const w = r.width, h = r.height;

        // Grid
        ctx.strokeStyle = "rgba(59,52,64,0.4)"; ctx.lineWidth = 0.5;
        for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
        for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

        // Ball
        const bx = w / 2, by = h / 2;
        ctx.beginPath(); ctx.arc(bx, by, 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(59,130,246,0.8)"; ctx.fill();
        ctx.strokeStyle = "rgba(59,130,246,0.4)"; ctx.lineWidth = 1; ctx.stroke();

        // Labels
        ctx.font = "11px ui-monospace, monospace";
        ctx.fillStyle = "rgba(134,126,142,0.6)";
        ctx.fillText(`pos: (${bx.toFixed(0)}, ${by.toFixed(0)})`, 8, 16);
        ctx.fillText("vel: (0, 0)", 8, 30);

        // Annotation
        ctx.fillStyle = "rgba(251,191,36,0.6)"; ctx.font = "10px ui-monospace, monospace";
        ctx.fillText("x", bx + 12, by + 4);
        ctx.fillText("y", bx + 2, by + 22);
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + 10, by);
        ctx.strokeStyle = "rgba(251,191,36,0.4)"; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by + 16);
        ctx.stroke();
    }, []);

    return (
        <div className="my-8 border border-nickel">
            <div className="px-4 py-2.5 border-b border-nickel" style={{ background: "rgba(255,255,255,0.02)" }}>
                <span className="text-[10px] font-mono text-grey/50 tracking-widest uppercase">interactive · a particle at rest</span>
            </div>
            <canvas ref={canvasRef} className="w-full" style={{ height: 200, display: "block" }} />
            <div className="px-4 py-2 border-t border-nickel/40">
                <span className="text-[10px] font-mono text-grey/30">a single dot on a canvas · position (x, y) and zero velocity</span>
            </div>
        </div>
    );
}

/* ── Demo 1b: Velocity (no walls) ───────────────────── */
function VelocityDemo() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        const dpr = window.devicePixelRatio || 1;
        let raf: number;

        const resize = () => {
            const r = canvas.getBoundingClientRect();
            canvas.width = r.width * dpr;
            canvas.height = r.height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();

        const initVx = 2, initVy = 1.2;
        let ball = { x: 60, y: 100, vx: initVx, vy: initVy, radius: 8 };
        const trail: { x: number; y: number }[] = [];

        const step = () => {
            const r = canvas.getBoundingClientRect();
            const w = r.width, h = r.height;
            ctx.clearRect(0, 0, w, h);

            // Grid
            ctx.strokeStyle = "rgba(59,52,64,0.4)"; ctx.lineWidth = 0.5;
            for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
            for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

            // No forces, no walls - pure velocity
            ball.x += ball.vx;
            ball.y += ball.vy;

            // Reset when ball exits
            if (ball.x > w + 20 || ball.y > h + 20 || ball.x < -20 || ball.y < -20) {
                ball = { x: 60, y: 100, vx: initVx, vy: initVy, radius: 8 };
                trail.length = 0;
            }

            trail.push({ x: ball.x, y: ball.y });
            if (trail.length > 120) trail.shift();

            // Trail
            for (let i = 1; i < trail.length; i++) {
                const a = i / trail.length;
                ctx.beginPath(); ctx.moveTo(trail[i - 1].x, trail[i - 1].y); ctx.lineTo(trail[i].x, trail[i].y);
                ctx.strokeStyle = `rgba(59,130,246,${(a * 0.3).toFixed(2)})`; ctx.lineWidth = 1; ctx.stroke();
            }

            // Velocity arrow - always the same because vx/vy never change
            const arrowScale = 15;
            ctx.beginPath(); ctx.moveTo(ball.x, ball.y);
            ctx.lineTo(ball.x + ball.vx * arrowScale, ball.y + ball.vy * arrowScale);
            ctx.strokeStyle = "rgba(251,191,36,0.8)"; ctx.lineWidth = 2; ctx.stroke();
            // Arrowhead
            const angle = Math.atan2(ball.vy, ball.vx);
            const ax = ball.x + ball.vx * arrowScale, ay = ball.y + ball.vy * arrowScale;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(ax - 7 * Math.cos(angle - 0.4), ay - 7 * Math.sin(angle - 0.4));
            ctx.moveTo(ax, ay);
            ctx.lineTo(ax - 7 * Math.cos(angle + 0.4), ay - 7 * Math.sin(angle + 0.4));
            ctx.stroke();

            // Ball
            ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(59,130,246,0.8)"; ctx.fill();
            ctx.strokeStyle = "rgba(59,130,246,0.4)"; ctx.lineWidth = 1; ctx.stroke();

            // HUD
            ctx.font = "11px ui-monospace, monospace";
            ctx.fillStyle = "rgba(134,126,142,0.6)";
            ctx.fillText(`pos: (${ball.x.toFixed(0)}, ${ball.y.toFixed(0)})`, 8, 16);
            ctx.fillText(`vel: (${ball.vx.toFixed(1)}, ${ball.vy.toFixed(1)})  — constant`, 8, 30);

            raf = requestAnimationFrame(step);
        };
        step();
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <div className="my-8 border border-nickel">
            <div className="px-4 py-2.5 border-b border-nickel" style={{ background: "rgba(255,255,255,0.02)" }}>
                <span className="text-[10px] font-mono text-grey/50 tracking-widest uppercase">interactive · velocity without walls</span>
            </div>
            <canvas ref={canvasRef} className="w-full" style={{ height: 240, display: "block" }} />
            <div className="px-4 py-2 border-t border-nickel/40">
                <span className="text-[10px] font-mono text-grey/30">yellow arrow = velocity vector (constant direction & length) · ball resets when it exits the canvas</span>
            </div>
        </div>
    );
}

/* ── Demo 1c: Wall Bounce ───────────────────────────── */
function WallBounceDemo() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [gravity, setGravity] = useState(0.1);
    const [drag, setDrag] = useState(0.01);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        const dpr = window.devicePixelRatio || 1;
        let raf: number;

        const resize = () => {
            const r = canvas.getBoundingClientRect();
            canvas.width = r.width * dpr;
            canvas.height = r.height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();

        let ball = { x: 60, y: 60, vx: 3, vy: 0, radius: 8 };
        const trail: { x: number; y: number; age: number }[] = [];

        const step = () => {
            const r = canvas.getBoundingClientRect();
            const w = r.width, h = r.height;
            ctx.clearRect(0, 0, w, h);

            // Grid
            ctx.strokeStyle = "rgba(59,52,64,0.4)"; ctx.lineWidth = 0.5;
            for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
            for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

            // Forces
            ball.vy += gravity;
            ball.vx *= (1 - drag);
            ball.vy *= (1 - drag);

            // Integrate
            ball.x += ball.vx;
            ball.y += ball.vy;

            // Wall bounce
            let hitWall = false;
            if (ball.y + ball.radius > h) { ball.y = h - ball.radius; ball.vy *= -0.7; hitWall = true; }
            if (ball.x + ball.radius > w) { ball.x = w - ball.radius; ball.vx *= -0.7; hitWall = true; }
            if (ball.x - ball.radius < 0) { ball.x = ball.radius; ball.vx *= -0.7; hitWall = true; }
            if (ball.y - ball.radius < 0) { ball.y = ball.radius; ball.vy *= -0.7; hitWall = true; }

            trail.push({ x: ball.x, y: ball.y, age: 0 });
            if (trail.length > 80) trail.shift();

            // Trail
            for (let i = 0; i < trail.length; i++) {
                const t = trail[i]; t.age++;
                const alpha = 1 - t.age / 100;
                if (alpha <= 0) continue;
                ctx.beginPath(); ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(59,130,246,${(alpha * 0.4).toFixed(2)})`; ctx.fill();
            }

            // Velocity arrow - scales with actual velocity
            const arrowScale = 10;
            const ax = ball.x + ball.vx * arrowScale, ay = ball.y + ball.vy * arrowScale;
            ctx.beginPath(); ctx.moveTo(ball.x, ball.y); ctx.lineTo(ax, ay);
            ctx.strokeStyle = "rgba(251,191,36,0.8)"; ctx.lineWidth = 2; ctx.stroke();
            const angle = Math.atan2(ball.vy, ball.vx);
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(ax - 7 * Math.cos(angle - 0.4), ay - 7 * Math.sin(angle - 0.4));
            ctx.moveTo(ax, ay);
            ctx.lineTo(ax - 7 * Math.cos(angle + 0.4), ay - 7 * Math.sin(angle + 0.4));
            ctx.stroke();

            // Flash wall on bounce
            if (hitWall) {
                ctx.strokeStyle = "rgba(239,68,68,0.3)"; ctx.lineWidth = 2;
                ctx.strokeRect(1, 1, w - 2, h - 2);
            }

            // Ball
            ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(59,130,246,0.8)"; ctx.fill();
            ctx.strokeStyle = "rgba(59,130,246,0.4)"; ctx.lineWidth = 1; ctx.stroke();

            // HUD
            ctx.font = "11px ui-monospace, monospace";
            ctx.fillStyle = "rgba(134,126,142,0.6)";
            ctx.fillText(`pos: (${ball.x.toFixed(0)}, ${ball.y.toFixed(0)})`, 8, 16);
            ctx.fillText(`vel: (${ball.vx.toFixed(2)}, ${ball.vy.toFixed(2)})`, 8, 30);

            raf = requestAnimationFrame(step);
        };
        step();

        const handleClick = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            ball = { x: e.clientX - rect.left, y: e.clientY - rect.top, vx: (Math.random() - 0.5) * 6, vy: -3, radius: 8 };
            trail.length = 0;
        };
        canvas.addEventListener("click", handleClick);
        return () => { cancelAnimationFrame(raf); canvas.removeEventListener("click", handleClick); };
    }, [gravity, drag]);

    return (
        <div className="my-8 border border-nickel">
            <div className="px-4 py-2.5 border-b border-nickel" style={{ background: "rgba(255,255,255,0.02)" }}>
                <span className="text-[10px] font-mono text-grey/50 tracking-widest uppercase">interactive · wall bounce + forces</span>
            </div>
            <canvas ref={canvasRef} className="w-full cursor-crosshair" style={{ height: 280, display: "block" }} />
            <div className="flex flex-wrap gap-6 px-4 py-3 border-t border-nickel" style={{ background: "rgba(255,255,255,0.02)" }}>
                <label className="flex items-center gap-2 text-xs font-mono text-grey/60">
                    gravity <input type="range" min="0" max="0.5" step="0.01" value={gravity} onChange={e => setGravity(+e.target.value)} className="w-20 accent-ruby" />
                    <span className="text-ruby/60 w-8">{gravity.toFixed(2)}</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-mono text-grey/60">
                    friction <input type="range" min="0" max="0.1" step="0.001" value={drag} onChange={e => setDrag(+e.target.value)} className="w-20 accent-ruby" />
                    <span className="text-ruby/60 w-10">{(drag * 100).toFixed(1)}%</span>
                </label>
            </div>
            <div className="px-4 py-2 border-t border-nickel/40">
                <span className="text-[10px] font-mono text-grey/30">click anywhere to reset · yellow arrow = velocity (changes on bounce) · red flash = wall hit</span>
            </div>
        </div>
    );
}

/* ── Demo 2: Collision visualizer ───────────────────── */
function CollisionDemo() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [particleCount, setParticleCount] = useState(60);
    const [collisionBounce, setCollisionBounce] = useState(0.4);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        const dpr = window.devicePixelRatio || 1;
        let raf: number;

        const resize = () => {
            const r = canvas.getBoundingClientRect();
            canvas.width = r.width * dpr;
            canvas.height = r.height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();

        interface P { x: number; y: number; vx: number; vy: number; r: number; }
        let particles: P[] = [];
        const R = 6;

        const init = () => {
            const r = canvas.getBoundingClientRect();
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: R + Math.random() * (r.width - R * 2),
                    y: R + Math.random() * (r.height - R * 2),
                    vx: (Math.random() - 0.5) * 3,
                    vy: (Math.random() - 0.5) * 3,
                    r: R,
                });
            }
        };
        init();

        let mouseX = -999, mouseY = -999;

        const step = () => {
            const rect = canvas.getBoundingClientRect();
            const w = rect.width, h = rect.height;
            ctx.clearRect(0, 0, w, h);

            // Grid background
            ctx.strokeStyle = "rgba(59,52,64,0.25)";
            ctx.lineWidth = 0.5;
            for (let x = 0; x < w; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
            for (let y = 0; y < h; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

            // Physics
            for (const p of particles) {
                p.vy += 0.06; // gravity
                p.vx *= 0.995; p.vy *= 0.995; // mild friction
                // Mouse push
                if (mouseX > 0) {
                    const dx = p.x - mouseX, dy = p.y - mouseY;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < 80 * 80 && d2 > 1) {
                        const d = Math.sqrt(d2);
                        const f = ((80 - d) / 80) * 6;
                        p.vx += (dx / d) * f; p.vy += (dy / d) * f;
                    }
                }
                p.x += p.vx; p.y += p.vy;
                // Walls
                if (p.x - p.r < 0) { p.x = p.r; p.vx = Math.abs(p.vx) * 0.5; }
                if (p.x + p.r > w) { p.x = w - p.r; p.vx = -Math.abs(p.vx) * 0.5; }
                if (p.y - p.r < 0) { p.y = p.r; p.vy = Math.abs(p.vy) * 0.5; }
                if (p.y + p.r > h) { p.y = h - p.r; p.vy = -Math.abs(p.vy) * 0.5; }
            }

            // Collision resolution
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i], b = particles[j];
                    const dx = b.x - a.x, dy = b.y - a.y;
                    const d2 = dx * dx + dy * dy;
                    const minD = a.r + b.r;
                    if (d2 < minD * minD && d2 > 0.001) {
                        const d = Math.sqrt(d2);
                        const nx = dx / d, ny = dy / d;
                        const overlap = minD - d;
                        a.x -= nx * overlap * 0.5; a.y -= ny * overlap * 0.5;
                        b.x += nx * overlap * 0.5; b.y += ny * overlap * 0.5;
                        const relV = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
                        if (relV > 0) {
                            const imp = relV * collisionBounce;
                            a.vx -= imp * nx; a.vy -= imp * ny;
                            b.vx += imp * nx; b.vy += imp * ny;
                        }
                        // Draw collision line
                        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = "rgba(251,191,36,0.3)"; ctx.lineWidth = 0.5; ctx.stroke();
                    }
                }
            }

            // Draw
            for (const p of particles) {
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                const t = Math.min(speed / 6, 1);
                const alpha = 0.4 + t * 0.4;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r - 1, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${Math.round(40 + t * 19)}, ${Math.round(100 + t * 30)}, ${Math.round(210 + t * 36)}, ${alpha.toFixed(2)})`;
                ctx.fill();
            }

            ctx.font = "11px ui-monospace, monospace";
            ctx.fillStyle = "rgba(134,126,142,0.5)";
            ctx.fillText(`particles: ${particles.length}`, 8, 16);

            raf = requestAnimationFrame(step);
        };
        step();

        const onMove = (e: MouseEvent) => { const r = canvas.getBoundingClientRect(); mouseX = e.clientX - r.left; mouseY = e.clientY - r.top; };
        const onLeave = () => { mouseX = -999; mouseY = -999; };
        canvas.addEventListener("mousemove", onMove);
        canvas.addEventListener("mouseleave", onLeave);
        return () => { cancelAnimationFrame(raf); canvas.removeEventListener("mousemove", onMove); canvas.removeEventListener("mouseleave", onLeave); };
    }, [particleCount, collisionBounce]);

    return (
        <div className="my-8 border border-nickel">
            <div className="px-4 py-2.5 border-b border-nickel" style={{ background: "rgba(255,255,255,0.02)" }}>
                <span className="text-[10px] font-mono text-grey/50 tracking-widest uppercase">interactive · particle collisions</span>
            </div>
            <canvas ref={canvasRef} className="w-full cursor-crosshair" style={{ height: 300, display: "block" }} />
            <div className="flex flex-wrap gap-6 px-4 py-3 border-t border-nickel" style={{ background: "rgba(255,255,255,0.02)" }}>
                <label className="flex items-center gap-2 text-xs font-mono text-grey/60">
                    count <input type="range" min="10" max="150" step="5" value={particleCount} onChange={e => setParticleCount(+e.target.value)} className="w-20 accent-ruby" />
                    <span className="text-ruby/60 w-6">{particleCount}</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-mono text-grey/60">
                    bounce <input type="range" min="0" max="1" step="0.05" value={collisionBounce} onChange={e => setCollisionBounce(+e.target.value)} className="w-20 accent-ruby" />
                    <span className="text-ruby/60 w-8">{collisionBounce.toFixed(2)}</span>
                </label>
            </div>
            <div className="px-4 py-2 border-t border-nickel/40">
                <span className="text-[10px] font-mono text-grey/30">move mouse to push particles · yellow lines = active collisions · particles pool at the bottom under gravity</span>
            </div>
        </div>
    );
}

/* ── Demo 3: Spatial Hash Visualizer ────────────────── */
function SpatialHashDemo() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cellSize, setCellSize] = useState(50);
    const [showGrid, setShowGrid] = useState(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        const dpr = window.devicePixelRatio || 1;
        let raf: number;

        const resize = () => {
            const r = canvas.getBoundingClientRect();
            canvas.width = r.width * dpr;
            canvas.height = r.height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();

        interface P { x: number; y: number; vx: number; vy: number; }
        const particles: P[] = [];
        const R = 5;

        const rct = canvas.getBoundingClientRect();
        for (let i = 0; i < 80; i++) {
            particles.push({
                x: R + Math.random() * (rct.width - R * 2),
                y: R + Math.random() * (rct.height - R * 2),
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
            });
        }

        let hoverCell = { cx: -1, cy: -1 };
        let mouseX = -1, mouseY = -1;

        const step = () => {
            const rect = canvas.getBoundingClientRect();
            const w = rect.width, h = rect.height;
            ctx.clearRect(0, 0, w, h);

            // Update hover cell
            if (mouseX >= 0) {
                hoverCell = { cx: Math.floor(mouseX / cellSize), cy: Math.floor(mouseY / cellSize) };
            }

            // Draw grid
            if (showGrid) {
                for (let x = 0; x < w; x += cellSize) {
                    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h);
                    ctx.strokeStyle = "rgba(59,52,64,0.5)"; ctx.lineWidth = 0.5; ctx.stroke();
                }
                for (let y = 0; y < h; y += cellSize) {
                    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y);
                    ctx.strokeStyle = "rgba(59,52,64,0.5)"; ctx.lineWidth = 0.5; ctx.stroke();
                }

                // Highlight hovered cell & neighbors
                if (hoverCell.cx >= 0) {
                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dy = -1; dy <= 1; dy++) {
                            const cx = hoverCell.cx + dx, cy = hoverCell.cy + dy;
                            const isCenter = dx === 0 && dy === 0;
                            ctx.fillStyle = isCenter ? "rgba(59,130,246,0.08)" : "rgba(59,130,246,0.03)";
                            ctx.fillRect(cx * cellSize, cy * cellSize, cellSize, cellSize);
                            if (isCenter) {
                                ctx.strokeStyle = "rgba(59,130,246,0.3)"; ctx.lineWidth = 1;
                                ctx.strokeRect(cx * cellSize, cy * cellSize, cellSize, cellSize);
                            }
                        }
                    }
                }
            }

            // Move particles (simple bounce)
            for (const p of particles) {
                p.vy += 0.02;
                p.x += p.vx; p.y += p.vy;
                p.vx *= 0.998; p.vy *= 0.998;
                if (p.x < R) { p.x = R; p.vx *= -0.8; }
                if (p.x > w - R) { p.x = w - R; p.vx *= -0.8; }
                if (p.y < R) { p.y = R; p.vy *= -0.8; }
                if (p.y > h - R) { p.y = h - R; p.vy *= -0.8; }
            }

            // Build hash & check what's in hovered cell's neighborhood
            const inNeighborhood = new Set<number>();
            if (hoverCell.cx >= 0) {
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    const pcx = Math.floor(p.x / cellSize), pcy = Math.floor(p.y / cellSize);
                    if (Math.abs(pcx - hoverCell.cx) <= 1 && Math.abs(pcy - hoverCell.cy) <= 1) {
                        inNeighborhood.add(i);
                    }
                }
            }

            // Draw particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const inHood = inNeighborhood.has(i);
                ctx.beginPath(); ctx.arc(p.x, p.y, R - 1, 0, Math.PI * 2);
                ctx.fillStyle = inHood ? "rgba(59,130,246,0.8)" : "rgba(134,126,142,0.3)";
                ctx.fill();
            }

            // HUD
            ctx.font = "11px ui-monospace, monospace";
            ctx.fillStyle = "rgba(134,126,142,0.5)";
            ctx.fillText(`cell: (${hoverCell.cx}, ${hoverCell.cy})  |  neighbors checked: ${inNeighborhood.size}/${particles.length}`, 8, 16);

            raf = requestAnimationFrame(step);
        };
        step();

        const onMove = (e: MouseEvent) => { const r = canvas.getBoundingClientRect(); mouseX = e.clientX - r.left; mouseY = e.clientY - r.top; };
        const onLeave = () => { mouseX = -1; mouseY = -1; hoverCell = { cx: -1, cy: -1 }; };
        canvas.addEventListener("mousemove", onMove);
        canvas.addEventListener("mouseleave", onLeave);
        return () => { cancelAnimationFrame(raf); canvas.removeEventListener("mousemove", onMove); canvas.removeEventListener("mouseleave", onLeave); };
    }, [cellSize, showGrid]);

    return (
        <div className="my-8 border border-nickel">
            <div className="px-4 py-2.5 border-b border-nickel" style={{ background: "rgba(255,255,255,0.02)" }}>
                <span className="text-[10px] font-mono text-grey/50 tracking-widest uppercase">interactive · spatial hash grid</span>
            </div>
            <canvas ref={canvasRef} className="w-full cursor-crosshair" style={{ height: 280, display: "block" }} />
            <div className="flex flex-wrap gap-4 px-4 py-3 border-t border-nickel" style={{ background: "rgba(255,255,255,0.02)" }}>
                <label className="flex items-center gap-2 text-xs font-mono text-grey/60">
                    cell size <input type="range" min="20" max="100" step="5" value={cellSize} onChange={e => setCellSize(+e.target.value)} className="w-20 accent-ruby" />
                    <span className="text-ruby/60 w-8">{cellSize}px</span>
                </label>
                <button onClick={() => setShowGrid(!showGrid)}
                    className="text-[10px] font-mono px-2 py-0.5 border cursor-pointer transition-colors"
                    style={{ borderColor: showGrid ? "rgba(59,130,246,0.4)" : "rgba(59,52,64,0.6)", color: showGrid ? "#3B82F6" : "rgba(134,126,142,0.6)", background: showGrid ? "rgba(59,130,246,0.08)" : "transparent" }}>
                    grid {showGrid ? "on" : "off"}
                </button>
            </div>
            <div className="px-4 py-2 border-t border-nickel/40">
                <span className="text-[10px] font-mono text-grey/30">hover a cell to see which particles a spatial hash would check · blue = in neighborhood (3x3 cells) · grey = skipped</span>
            </div>
        </div>
    );
}

/* ── Demo 5: Fluid Simulation ───────────────────────── */
function FluidDemo() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [particleCount, setParticleCount] = useState(200);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        const dpr = window.devicePixelRatio || 1;
        let raf: number;

        const resize = () => {
            const r = canvas.getBoundingClientRect();
            canvas.width = r.width * dpr;
            canvas.height = r.height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();

        const R = 4;
        const GRAVITY = 0.08;
        const FRICTION = 0.98;
        const BOUNCE = 0.4;
        const MOUSE_RADIUS = 100;
        const MOUSE_FORCE = 8;
        const CELL = R * 2;

        interface P { x: number; y: number; vx: number; vy: number; r: number; }
        let particles: P[] = [];

        const rct = canvas.getBoundingClientRect();
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: R + Math.random() * (rct.width - R * 2),
                y: R + Math.random() * (rct.height * 0.5),
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                r: R,
            });
        }

        let mouseX = -999, mouseY = -999;
        let pouring = false;

        // Spatial hash for O(n) collisions
        const grid = new Map<number, number[]>();
        const key = (cx: number, cy: number) => cx * 73856093 ^ cy * 19349669;

        const buildGrid = () => {
            grid.clear();
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const cx = Math.floor(p.x / CELL), cy = Math.floor(p.y / CELL);
                const k = key(cx, cy);
                const bucket = grid.get(k);
                if (bucket) bucket.push(i); else grid.set(k, [i]);
            }
        };

        const resolveCollisions = () => {
            for (let i = 0; i < particles.length; i++) {
                const a = particles[i];
                const cx = Math.floor(a.x / CELL), cy = Math.floor(a.y / CELL);
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        const bucket = grid.get(key(cx + dx, cy + dy));
                        if (!bucket) continue;
                        for (const j of bucket) {
                            if (j <= i) continue;
                            const b = particles[j];
                            const ddx = b.x - a.x, ddy = b.y - a.y;
                            const d2 = ddx * ddx + ddy * ddy;
                            const minD = a.r + b.r;
                            if (d2 < minD * minD && d2 > 0.001) {
                                const d = Math.sqrt(d2);
                                const nx = ddx / d, ny = ddy / d;
                                const overlap = minD - d;
                                a.x -= nx * overlap * 0.5; a.y -= ny * overlap * 0.5;
                                b.x += nx * overlap * 0.5; b.y += ny * overlap * 0.5;
                                const relV = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
                                if (relV > 0) {
                                    const imp = relV * BOUNCE;
                                    a.vx -= imp * nx; a.vy -= imp * ny;
                                    b.vx += imp * nx; b.vy += imp * ny;
                                }
                            }
                        }
                    }
                }
            }
        };

        const step = () => {
            const rect = canvas.getBoundingClientRect();
            const w = rect.width, h = rect.height;
            ctx.clearRect(0, 0, w, h);

            // Pour mode
            if (pouring && mouseX > 0 && particles.length < 900) {
                for (let i = 0; i < 3; i++) {
                    particles.push({
                        x: mouseX + (Math.random() - 0.5) * 6,
                        y: mouseY,
                        vx: (Math.random() - 0.5) * 1,
                        vy: 0.5 + Math.random() * 1.2,
                        r: R,
                    });
                }
            }

            // Physics
            for (const p of particles) {
                p.vy += GRAVITY;
                p.vx *= FRICTION; p.vy *= FRICTION;

                // Mouse push (only when not pouring)
                if (!pouring && mouseX > 0) {
                    const dx = p.x - mouseX, dy = p.y - mouseY;
                    const d2 = dx * dx + dy * dy;
                    if (d2 < MOUSE_RADIUS * MOUSE_RADIUS && d2 > 1) {
                        const d = Math.sqrt(d2);
                        const f = ((MOUSE_RADIUS - d) / MOUSE_RADIUS) * MOUSE_FORCE;
                        p.vx += (dx / d) * f; p.vy += (dy / d) * f;
                    }
                }

                p.x += p.vx; p.y += p.vy;

                // Walls
                if (p.x - p.r < 0) { p.x = p.r; p.vx *= -0.3; }
                if (p.x + p.r > w) { p.x = w - p.r; p.vx *= -0.3; }
                if (p.y - p.r < 0) { p.y = p.r; p.vy *= -0.3; }
                if (p.y + p.r > h) { p.y = h - p.r; p.vy *= -0.3; }
            }

            // Spatial hash collision (2 passes for stability)
            buildGrid();
            resolveCollisions();
            buildGrid();
            resolveCollisions();

            // Re-clamp after collision pushes
            for (const p of particles) {
                if (p.x - p.r < 0) p.x = p.r;
                if (p.x + p.r > w) p.x = w - p.r;
                if (p.y - p.r < 0) p.y = p.r;
                if (p.y + p.r > h) p.y = h - p.r;
            }

            // Draw with velocity-based color
            for (const p of particles) {
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                const t = Math.min(speed / 6, 1);
                const b = Math.round(210 + t * 36);
                const alpha = 0.4 + t * 0.4;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r - 0.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${Math.round(40 + t * 19)}, ${Math.round(100 + t * 30)}, ${b}, ${alpha.toFixed(2)})`;
                ctx.fill();
            }

            // Mouse radius indicator
            if (mouseX > 0 && !pouring) {
                ctx.beginPath(); ctx.arc(mouseX, mouseY, MOUSE_RADIUS, 0, Math.PI * 2);
                ctx.strokeStyle = "rgba(59,130,246,0.15)"; ctx.lineWidth = 1; ctx.stroke();
            }

            // HUD
            ctx.font = "11px ui-monospace, monospace";
            ctx.fillStyle = "rgba(134,126,142,0.5)";
            ctx.fillText(`particles: ${particles.length}  |  hover: push · click+hold: pour`, 8, 16);

            raf = requestAnimationFrame(step);
        };
        step();

        const onMove = (e: MouseEvent) => { const r = canvas.getBoundingClientRect(); mouseX = e.clientX - r.left; mouseY = e.clientY - r.top; };
        const onLeave = () => { mouseX = -999; mouseY = -999; pouring = false; };
        const onDown = () => { pouring = true; };
        const onUp = () => { pouring = false; };
        canvas.addEventListener("mousemove", onMove);
        canvas.addEventListener("mouseleave", onLeave);
        canvas.addEventListener("mousedown", onDown);
        canvas.addEventListener("mouseup", onUp);
        return () => {
            cancelAnimationFrame(raf);
            canvas.removeEventListener("mousemove", onMove);
            canvas.removeEventListener("mouseleave", onLeave);
            canvas.removeEventListener("mousedown", onDown);
            canvas.removeEventListener("mouseup", onUp);
        };
    }, [particleCount]);

    return (
        <div className="my-8 border border-nickel">
            <div className="px-4 py-2.5 border-b border-nickel" style={{ background: "rgba(255,255,255,0.02)" }}>
                <span className="text-[10px] font-mono text-grey/50 tracking-widest uppercase">interactive · fluid simulation</span>
            </div>
            <canvas ref={canvasRef} className="w-full cursor-crosshair" style={{ height: 340, display: "block" }} />
            <div className="flex flex-wrap gap-6 px-4 py-3 border-t border-nickel" style={{ background: "rgba(255,255,255,0.02)" }}>
                <label className="flex items-center gap-2 text-xs font-mono text-grey/60">
                    initial count <input type="range" min="50" max="500" step="10" value={particleCount} onChange={e => setParticleCount(+e.target.value)} className="w-24 accent-ruby" />
                    <span className="text-ruby/60 w-8">{particleCount}</span>
                </label>
            </div>
            <div className="px-4 py-2 border-t border-nickel/40">
                <span className="text-[10px] font-mono text-grey/30">hover to push · click and hold to pour new particles · color = speed · spatial hash collisions</span>
            </div>
        </div>
    );
}

/* ── Demo 4: Forces visualizer ──────────────────────── */
function ForceDiagram() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [showGravity, setShowGravity] = useState(true);
    const [showDrag, setShowDrag] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        const dpr = window.devicePixelRatio || 1;
        let raf: number;

        const resize = () => {
            const r = canvas.getBoundingClientRect();
            canvas.width = r.width * dpr;
            canvas.height = r.height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();

        let ball = { x: 0, y: 0, vx: 2, vy: -3 };
        const trail: { x: number; y: number }[] = [];
        let frame = 0;

        const step = () => {
            const r = canvas.getBoundingClientRect();
            const w = r.width, h = r.height;
            ctx.clearRect(0, 0, w, h);

            ctx.strokeStyle = "rgba(59,52,64,0.3)"; ctx.lineWidth = 0.5;
            for (let x = 0; x < w; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
            for (let y = 0; y < h; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

            frame++;
            if (frame % 180 === 0) { ball = { x: 40, y: h * 0.4, vx: 2, vy: -3 }; trail.length = 0; }

            if (showGravity) ball.vy += 0.08;
            if (showDrag) { ball.vx *= 0.99; ball.vy *= 0.99; }

            ball.x += ball.vx; ball.y += ball.vy;
            if (ball.y > h - 10) { ball.y = h - 10; ball.vy *= -0.7; }
            if (ball.x > w - 10) { ball.x = w - 10; ball.vx *= -0.7; }
            if (ball.x < 10) { ball.x = 10; ball.vx *= -0.7; }
            if (ball.y < 10) { ball.y = 10; ball.vy *= -0.7; }

            trail.push({ x: ball.x, y: ball.y });
            if (trail.length > 120) trail.shift();

            for (let i = 1; i < trail.length; i++) {
                const alpha = i / trail.length;
                ctx.beginPath(); ctx.moveTo(trail[i - 1].x, trail[i - 1].y); ctx.lineTo(trail[i].x, trail[i].y);
                ctx.strokeStyle = `rgba(59,130,246,${(alpha * 0.3).toFixed(2)})`; ctx.lineWidth = 1; ctx.stroke();
            }

            const arrowLen = 30;
            if (showGravity) {
                drawArrow(ctx, ball.x, ball.y, ball.x, ball.y + arrowLen, "#FBBF24");
                ctx.fillStyle = "#FBBF24"; ctx.font = "10px ui-monospace, monospace";
                ctx.fillText("gravity", ball.x + 4, ball.y + arrowLen + 12);
            }
            if (showDrag) {
                const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
                if (speed > 0.1) {
                    drawArrow(ctx, ball.x, ball.y, ball.x + (-ball.vx / speed * 20), ball.y + (-ball.vy / speed * 20), "#EF4444");
                    ctx.fillStyle = "#EF4444"; ctx.font = "10px ui-monospace, monospace";
                    ctx.fillText("friction", ball.x + (-ball.vx / speed * 20), ball.y + (-ball.vy / speed * 20) - 8);
                }
            }

            ctx.beginPath(); ctx.arc(ball.x, ball.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(59,130,246,0.8)"; ctx.fill();
            raf = requestAnimationFrame(step);
        };
        step();
        return () => cancelAnimationFrame(raf);
    }, [showGravity, showDrag]);

    return (
        <div className="my-8 border border-nickel">
            <div className="px-4 py-2.5 border-b border-nickel" style={{ background: "rgba(255,255,255,0.02)" }}>
                <span className="text-[10px] font-mono text-grey/50 tracking-widest uppercase">interactive · forces visualizer</span>
            </div>
            <canvas ref={canvasRef} className="w-full" style={{ height: 260, display: "block" }} />
            <div className="flex flex-wrap gap-4 px-4 py-3 border-t border-nickel" style={{ background: "rgba(255,255,255,0.02)" }}>
                {[
                    { label: "gravity", active: showGravity, toggle: () => setShowGravity(!showGravity), color: "#FBBF24" },
                    { label: "friction", active: showDrag, toggle: () => setShowDrag(!showDrag), color: "#EF4444" },
                ].map(f => (
                    <button key={f.label} onClick={f.toggle}
                        className="text-[11px] font-mono px-3 py-1 border cursor-pointer transition-all"
                        style={{ borderColor: f.active ? f.color : "rgba(59,52,64,0.6)", color: f.active ? f.color : "rgba(134,126,142,0.5)", background: f.active ? `${f.color}11` : "transparent" }}>
                        {f.label}
                    </button>
                ))}
            </div>
            <div className="px-4 py-2 border-t border-nickel/40">
                <span className="text-[10px] font-mono text-grey/30">toggle forces to see how they affect trajectory · resets every 3s</span>
            </div>
        </div>
    );
}

function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, color: string) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
    ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x2, y2); ctx.lineTo(x2 - 6 * Math.cos(angle - 0.4), y2 - 6 * Math.sin(angle - 0.4));
    ctx.moveTo(x2, y2); ctx.lineTo(x2 - 6 * Math.cos(angle + 0.4), y2 - 6 * Math.sin(angle + 0.4));
    ctx.stroke();
}

/* ── Demo 5: SVG Text Mask ──────────────────────────── */
function SvgMaskDemo() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const showMaskRef = useRef(true);
    const maskTextRef = useRef("PARTICLE");
    const fontSizeRef = useRef(100);
    const [, forceRender] = useState(0);

    const setShowMask = (v: boolean) => { showMaskRef.current = v; forceRender(n => n + 1); };
    const setMaskText = (v: string) => { maskTextRef.current = v; forceRender(n => n + 1); };
    const setFontSize = (v: number) => { fontSizeRef.current = v; forceRender(n => n + 1); };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        const dpr = window.devicePixelRatio || 1;
        let raf: number;

        // Offscreen canvas for compositing
        const offscreen = document.createElement("canvas");
        const octx = offscreen.getContext("2d")!;

        const resize = () => {
            const r = canvas.getBoundingClientRect();
            canvas.width = r.width * dpr;
            canvas.height = r.height * dpr;
            offscreen.width = canvas.width;
            offscreen.height = canvas.height;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            octx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();

        interface P { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; }
        const particles: P[] = [];

        const step = () => {
            const r = canvas.getBoundingClientRect();
            const w = r.width, h = r.height;

            // Spawn
            if (particles.length < 300 && Math.random() < 0.5) {
                particles.push({
                    x: Math.random() * w, y: h + 5,
                    vx: (Math.random() - 0.5) * 0.5, vy: -(0.5 + Math.random() * 1.5),
                    life: 0, maxLife: 120 + Math.random() * 80, size: 1.5 + Math.random() * 2.5,
                });
            }

            // Update
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx; p.y += p.vy;
                p.vx += (Math.random() - 0.5) * 0.05;
                p.life++;
                if (p.life >= p.maxLife) particles.splice(i, 1);
            }

            // Clear main canvas
            ctx.clearRect(0, 0, w, h);

            if (showMaskRef.current) {
                const text = maskTextRef.current;
                const fSize = fontSizeRef.current;

                // Draw particles into offscreen
                octx.clearRect(0, 0, w, h);
                octx.globalCompositeOperation = "source-over";
                for (const p of particles) {
                    const t = p.life / p.maxLife;
                    const alpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
                    if (alpha <= 0) continue;
                    octx.beginPath(); octx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    octx.fillStyle = `rgba(59,130,246,${(alpha * 0.8).toFixed(2)})`; octx.fill();
                }

                // Mask: keep only particles inside text shape
                octx.globalCompositeOperation = "destination-in";
                octx.font = `bold ${fSize}px Inter, system-ui, sans-serif`;
                octx.textAlign = "center"; octx.textBaseline = "middle";
                octx.fillStyle = "white";
                octx.fillText(text, w / 2, h / 2);

                // Draw text outline on main canvas
                ctx.font = `bold ${fSize}px Inter, system-ui, sans-serif`;
                ctx.textAlign = "center"; ctx.textBaseline = "middle";
                ctx.strokeStyle = "rgba(59,130,246,0.12)"; ctx.lineWidth = 1;
                ctx.strokeText(text, w / 2, h / 2);

                // Composite offscreen result on top
                ctx.drawImage(offscreen, 0, 0, w * dpr, h * dpr, 0, 0, w, h);
            } else {
                // No mask - draw particles directly
                for (const p of particles) {
                    const t = p.life / p.maxLife;
                    const alpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
                    if (alpha <= 0) continue;
                    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(59,130,246,${(alpha * 0.8).toFixed(2)})`; ctx.fill();
                }
            }

            raf = requestAnimationFrame(step);
        };
        step();
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <div className="my-8 border border-nickel">
            <div className="px-4 py-2.5 border-b border-nickel" style={{ background: "rgba(255,255,255,0.02)" }}>
                <span className="text-[10px] font-mono text-grey/50 tracking-widest uppercase">interactive · canvas text masking</span>
            </div>
            <canvas ref={canvasRef} className="w-full" style={{ height: 300, display: "block", background: "#16171d" }} />
            <div className="flex flex-wrap gap-6 px-4 py-3 border-t border-nickel" style={{ background: "rgba(255,255,255,0.02)" }}>
                <label className="flex items-center gap-2 text-xs font-mono text-grey/60">
                    mask
                    <button onClick={() => setShowMask(!showMaskRef.current)}
                        className="text-[10px] font-mono px-2 py-0.5 border cursor-pointer transition-colors"
                        style={{ borderColor: showMaskRef.current ? "rgba(59,130,246,0.4)" : "rgba(59,52,64,0.6)", color: showMaskRef.current ? "#3B82F6" : "rgba(134,126,142,0.6)", background: showMaskRef.current ? "rgba(59,130,246,0.08)" : "transparent" }}>
                        {showMaskRef.current ? "on" : "off"}
                    </button>
                </label>
                <label className="flex items-center gap-2 text-xs font-mono text-grey/60">
                    text
                    <input type="text" value={maskTextRef.current} onChange={e => setMaskText(e.target.value.toUpperCase())}
                        className="w-24 bg-transparent border border-nickel/60 px-2 py-0.5 text-[11px] font-mono text-white focus:border-ruby/40 focus:outline-none transition-colors" />
                </label>
                <label className="flex items-center gap-2 text-xs font-mono text-grey/60">
                    size <input type="range" min="40" max="180" step="5" value={fontSizeRef.current} onChange={e => setFontSize(+e.target.value)} className="w-20 accent-ruby" />
                    <span className="text-ruby/60 w-8">{fontSizeRef.current}px</span>
                </label>
            </div>
            <div className="px-4 py-2 border-t border-nickel/40">
                <span className="text-[10px] font-mono text-grey/30">toggle mask to see particles flow freely vs. confined to text · try your name</span>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   SANDPACK CODE SNIPPETS
   ═══════════════════════════════════════════════════════ */

const SANDPACK_STATIC_BALL = `// A single dot on a canvas - the simplest particle
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const ball = { x: canvas.width / 2, y: canvas.height / 2, radius: 8 };

// Grid
ctx.strokeStyle = 'rgba(59,52,64,0.4)';
ctx.lineWidth = 0.5;
for (let x = 0; x < canvas.width; x += 40) {
  ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
}
for (let y = 0; y < canvas.height; y += 40) {
  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
}

// Draw ball
ctx.beginPath();
ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
ctx.fill();

// Labels
ctx.fillStyle = 'rgba(134,126,142,0.5)';
ctx.font = '11px monospace';
ctx.fillText('pos: (' + ball.x.toFixed(0) + ', ' + ball.y.toFixed(0) + ')', 8, 16);
ctx.fillText('vel: (0, 0)', 8, 28);

// Try changing ball.x and ball.y above!
// Or add more balls by duplicating the arc/fill calls.
`;

const SANDPACK_VELOCITY = `// Ball with constant velocity - no forces, no walls
// It flies off the edge and resets from the start
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let ball = { x: 60, y: 100, vx: 2, vy: 1.2, radius: 8 };
const trail = [];

function animate() {
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // No forces - velocity never changes
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Reset when ball exits canvas
  if (ball.x > w + 20 || ball.y > h + 20 || ball.x < -20 || ball.y < -20) {
    ball = { x: 60, y: 100, vx: 2, vy: 1.2, radius: 8 };
    trail.length = 0;
  }

  // Trail
  trail.push({ x: ball.x, y: ball.y });
  if (trail.length > 120) trail.shift();
  for (let i = 1; i < trail.length; i++) {
    const a = i / trail.length;
    ctx.beginPath();
    ctx.moveTo(trail[i-1].x, trail[i-1].y);
    ctx.lineTo(trail[i].x, trail[i].y);
    ctx.strokeStyle = 'rgba(59,130,246,' + (a * 0.3).toFixed(2) + ')';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Velocity arrow - always the same direction & length
  const arrowScale = 15;
  const ax = ball.x + ball.vx * arrowScale;
  const ay = ball.y + ball.vy * arrowScale;
  ctx.beginPath(); ctx.moveTo(ball.x, ball.y); ctx.lineTo(ax, ay);
  ctx.strokeStyle = 'rgba(251,191,36,0.8)'; ctx.lineWidth = 2; ctx.stroke();
  const angle = Math.atan2(ball.vy, ball.vx);
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(ax - 7 * Math.cos(angle - 0.4), ay - 7 * Math.sin(angle - 0.4));
  ctx.moveTo(ax, ay);
  ctx.lineTo(ax - 7 * Math.cos(angle + 0.4), ay - 7 * Math.sin(angle + 0.4));
  ctx.stroke();

  // Ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
  ctx.fill();

  // HUD
  ctx.fillStyle = 'rgba(134,126,142,0.5)';
  ctx.font = '11px monospace';
  ctx.fillText('pos: (' + ball.x.toFixed(0) + ', ' + ball.y.toFixed(0) + ')', 8, 16);
  ctx.fillText('vel: (' + ball.vx.toFixed(1) + ', ' + ball.vy.toFixed(1) + ')  \u2014 constant', 8, 28);

  // Try changing vx and vy above!
  // What happens with negative values?

  requestAnimationFrame(animate);
}
animate();
`;

const SANDPACK_BASIC_PARTICLE = `// A ball with velocity, gravity, friction, and wall bouncing
// Click anywhere to reset the ball
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

let ball = { x: 60, y: 60, vx: 3, vy: 0, radius: 8 };
const trail = [];

// Physics constants - try changing these!
const GRAVITY = 0.08;
const FRICTION = 0.99;
const WALL_BOUNCE = 0.7;  // energy kept after wall hit

// Click to reset
canvas.addEventListener('click', e => {
  const r = canvas.getBoundingClientRect();
  ball = {
    x: e.clientX - r.left,
    y: e.clientY - r.top,
    vx: (Math.random() - 0.5) * 6,
    vy: -3 - Math.random() * 2,
    radius: 8,
  };
  trail.length = 0;
});

function animate() {
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Apply forces
  ball.vy += GRAVITY;
  ball.vx *= FRICTION;
  ball.vy *= FRICTION;

  // Move
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Wall bounce
  let hitWall = false;
  if (ball.y + ball.radius > h) { ball.y = h - ball.radius; ball.vy *= -WALL_BOUNCE; hitWall = true; }
  if (ball.x + ball.radius > w) { ball.x = w - ball.radius; ball.vx *= -WALL_BOUNCE; hitWall = true; }
  if (ball.x - ball.radius < 0) { ball.x = ball.radius;     ball.vx *= -WALL_BOUNCE; hitWall = true; }
  if (ball.y - ball.radius < 0) { ball.y = ball.radius;     ball.vy *= -WALL_BOUNCE; hitWall = true; }

  // Trail
  trail.push({ x: ball.x, y: ball.y });
  if (trail.length > 80) trail.shift();
  for (let i = 1; i < trail.length; i++) {
    const a = i / trail.length;
    ctx.beginPath();
    ctx.moveTo(trail[i-1].x, trail[i-1].y);
    ctx.lineTo(trail[i].x, trail[i].y);
    ctx.strokeStyle = 'rgba(59,130,246,' + (a * 0.3).toFixed(2) + ')';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Velocity arrow
  const arrowScale = 10;
  const ax = ball.x + ball.vx * arrowScale;
  const ay = ball.y + ball.vy * arrowScale;
  ctx.beginPath(); ctx.moveTo(ball.x, ball.y); ctx.lineTo(ax, ay);
  ctx.strokeStyle = 'rgba(251,191,36,0.8)'; ctx.lineWidth = 2; ctx.stroke();
  const angle = Math.atan2(ball.vy, ball.vx);
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(ax - 7 * Math.cos(angle - 0.4), ay - 7 * Math.sin(angle - 0.4));
  ctx.moveTo(ax, ay);
  ctx.lineTo(ax - 7 * Math.cos(angle + 0.4), ay - 7 * Math.sin(angle + 0.4));
  ctx.stroke();

  // Flash wall on bounce
  if (hitWall) {
    ctx.strokeStyle = 'rgba(239,68,68,0.3)'; ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, w - 2, h - 2);
  }

  // Ball
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(59, 130, 246, 0.8)';
  ctx.fill();

  // HUD
  ctx.fillStyle = 'rgba(134,126,142,0.5)';
  ctx.font = '11px monospace';
  ctx.fillText('pos: (' + ball.x.toFixed(0) + ', ' + ball.y.toFixed(0) + ')', 8, 16);
  ctx.fillText('vel: (' + ball.vx.toFixed(2) + ', ' + ball.vy.toFixed(2) + ')', 8, 28);
  ctx.fillText('click anywhere to reset', 8, h - 8);

  requestAnimationFrame(animate);
}
animate();
`;

const SANDPACK_FORCES = `// Forces: gravity, friction, mouse push + arrow visualization
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

// Try changing these!
const GRAVITY = 0.08;
const FRICTION = 0.99;
const WALL_BOUNCE = 0.7;
const MOUSE_RADIUS = 80;
const MOUSE_FORCE = 8;

const R = 5;
const particles = [];
for (let i = 0; i < 30; i++) {
  particles.push({
    x: R + Math.random() * (canvas.width - R * 2),
    y: R + Math.random() * (canvas.height * 0.6),
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
  });
}

let mouseX = -999, mouseY = -999;
canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  mouseX = e.clientX - r.left;
  mouseY = e.clientY - r.top;
});
canvas.addEventListener('mouseleave', () => { mouseX = -999; mouseY = -999; });

function drawArrow(x1, y1, x2, y2, color) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 6 * Math.cos(angle - 0.4), y2 - 6 * Math.sin(angle - 0.4));
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 6 * Math.cos(angle + 0.4), y2 - 6 * Math.sin(angle + 0.4));
  ctx.stroke();
}

function animate() {
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Grid
  ctx.strokeStyle = 'rgba(59,52,64,0.3)'; ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

  for (const p of particles) {
    // Gravity
    p.vy += GRAVITY;
    // Friction
    p.vx *= FRICTION;
    p.vy *= FRICTION;

    // Mouse push
    if (mouseX > 0) {
      const dx = p.x - mouseX, dy = p.y - mouseY;
      const d2 = dx * dx + dy * dy;
      if (d2 < MOUSE_RADIUS * MOUSE_RADIUS && d2 > 1) {
        const d = Math.sqrt(d2);
        const f = ((MOUSE_RADIUS - d) / MOUSE_RADIUS) * MOUSE_FORCE;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }
    }

    // Integrate
    p.x += p.vx; p.y += p.vy;

    // Walls
    if (p.y > h - R) { p.y = h - R; p.vy *= -WALL_BOUNCE; }
    if (p.x > w - R) { p.x = w - R; p.vx *= -WALL_BOUNCE; }
    if (p.x < R)     { p.x = R;     p.vx *= -WALL_BOUNCE; }
    if (p.y < R)     { p.y = R;     p.vy *= -WALL_BOUNCE; }
  }

  // Draw force arrows on first few particles
  for (let i = 0; i < Math.min(3, particles.length); i++) {
    const p = particles[i];
    // Gravity arrow
    drawArrow(p.x, p.y, p.x, p.y + 20, '#FBBF24');
    // Friction arrow (opposes motion)
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speed > 0.5) {
      drawArrow(p.x, p.y, p.x + (-p.vx / speed) * 12, p.y + (-p.vy / speed) * 12, '#EF4444');
    }
  }

  // Draw mouse radius
  if (mouseX > 0) {
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, MOUSE_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(59,130,246,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw particles
  for (const p of particles) {
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    const t = Math.min(speed / 6, 1);
    ctx.beginPath(); ctx.arc(p.x, p.y, R, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(59,' + Math.round(100 + t * 30) + ',' + Math.round(210 + t * 36) + ',' + (0.4 + t * 0.4).toFixed(2) + ')';
    ctx.fill();
  }

  // Legend
  ctx.fillStyle = '#FBBF24'; ctx.font = '10px monospace';
  ctx.fillText('\u25BC gravity', 8, 16);
  ctx.fillStyle = '#EF4444';
  ctx.fillText('\u25BC friction', 8, 28);
  ctx.fillStyle = 'rgba(134,126,142,0.5)';
  ctx.fillText('hover to push particles', 8, h - 8);

  requestAnimationFrame(animate);
}
animate();
`;

const SANDPACK_SPATIAL_HASH = `// Spatial Hash Grid - hover to see neighborhood checks
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const CELL_SIZE = 50;    // try 20, 50, 100
const NUM_PARTICLES = 80;
const R = 5;

const particles = [];
for (let i = 0; i < NUM_PARTICLES; i++) {
  particles.push({
    x: R + Math.random() * (canvas.width - R * 2),
    y: R + Math.random() * (canvas.height - R * 2),
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
  });
}

let mouseX = -1, mouseY = -1;
canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  mouseX = e.clientX - r.left; mouseY = e.clientY - r.top;
});
canvas.addEventListener('mouseleave', () => { mouseX = -1; mouseY = -1; });

function animate() {
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Determine hovered cell
  let hcx = -1, hcy = -1;
  if (mouseX >= 0) { hcx = Math.floor(mouseX / CELL_SIZE); hcy = Math.floor(mouseY / CELL_SIZE); }

  // Draw grid
  ctx.strokeStyle = 'rgba(59,52,64,0.5)'; ctx.lineWidth = 0.5;
  for (let x = 0; x < w; x += CELL_SIZE) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
  for (let y = 0; y < h; y += CELL_SIZE) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

  // Highlight 3x3 neighborhood
  if (hcx >= 0) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const cx = hcx + dx, cy = hcy + dy;
        const isCenter = dx === 0 && dy === 0;
        ctx.fillStyle = isCenter ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.03)';
        ctx.fillRect(cx * CELL_SIZE, cy * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        if (isCenter) {
          ctx.strokeStyle = 'rgba(59,130,246,0.3)'; ctx.lineWidth = 1;
          ctx.strokeRect(cx * CELL_SIZE, cy * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }
  }

  // Physics
  for (const p of particles) {
    p.vy += 0.02;
    p.x += p.vx; p.y += p.vy;
    p.vx *= 0.998; p.vy *= 0.998;
    if (p.x < R) { p.x = R; p.vx *= -0.8; }
    if (p.x > w - R) { p.x = w - R; p.vx *= -0.8; }
    if (p.y < R) { p.y = R; p.vy *= -0.8; }
    if (p.y > h - R) { p.y = h - R; p.vy *= -0.8; }
  }

  // Build spatial hash & find neighbors
  const inNeighborhood = new Set();
  if (hcx >= 0) {
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const pcx = Math.floor(p.x / CELL_SIZE);
      const pcy = Math.floor(p.y / CELL_SIZE);
      if (Math.abs(pcx - hcx) <= 1 && Math.abs(pcy - hcy) <= 1) {
        inNeighborhood.add(i);
      }
    }
  }

  // Draw particles
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    ctx.beginPath(); ctx.arc(p.x, p.y, R - 1, 0, Math.PI * 2);
    ctx.fillStyle = inNeighborhood.has(i)
      ? 'rgba(59,130,246,0.8)' : 'rgba(134,126,142,0.3)';
    ctx.fill();
  }

  // HUD
  ctx.fillStyle = 'rgba(134,126,142,0.5)'; ctx.font = '11px monospace';
  ctx.fillText('cell: (' + hcx + ', ' + hcy + ')  neighbors: ' + inNeighborhood.size + '/' + particles.length, 8, 16);

  requestAnimationFrame(animate);
}
animate();
`;

const DIFF_COLLISIONS = `  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
 
  const GRAVITY = 0.08;
  const FRICTION = 0.99;
  const WALL_BOUNCE = 0.7;
+const PARTICLE_BOUNCE = 0.4;  // energy kept on particle-particle hit
+const R = 6;                  // collision radius
 
+// Instead of one ball, create 40 particles
+const particles = [];
+for (let i = 0; i < 40; i++) {
+  particles.push({
+    x: R + Math.random() * (canvas.width - R * 2),
+    y: R + Math.random() * (canvas.height * 0.5),
+    vx: (Math.random() - 0.5) * 3,
+    vy: (Math.random() - 0.5) * 3,
+    r: R,
+  });
+}
 
+// Check every pair of particles for overlap
+function resolveCollisions() {
+  for (let i = 0; i < particles.length; i++) {
+    for (let j = i + 1; j < particles.length; j++) {
+      const a = particles[i], b = particles[j];
+      const dx = b.x - a.x, dy = b.y - a.y;
+      const d2 = dx * dx + dy * dy;
+      const minD = a.r + b.r;
 
+      if (d2 < minD * minD && d2 > 0.001) {
+        const d = Math.sqrt(d2);
+        const nx = dx / d, ny = dy / d;
+        const overlap = minD - d;
 
+        // Push apart equally
+        a.x -= nx * overlap * 0.5;
+        a.y -= ny * overlap * 0.5;
+        b.x += nx * overlap * 0.5;
+        b.y += ny * overlap * 0.5;
 
+        // Exchange velocity along the collision normal
+        const relV = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
+        if (relV > 0) {
+          const imp = relV * PARTICLE_BOUNCE;
+          a.vx -= imp * nx; a.vy -= imp * ny;
+          b.vx += imp * nx; b.vy += imp * ny;
+        }
+      }
+    }
+  }
+}
 
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
 
    // Same physics as before - gravity, friction, walls
    for (const p of particles) {
      p.vy += GRAVITY;
      p.vx *= FRICTION;
      p.vy *= FRICTION;
      p.x += p.vx;
      p.y += p.vy;
      // ...wall bouncing (same as before)...
    }
 
+  // Resolve collisions (twice for stability)
+  resolveCollisions();
+  resolveCollisions();
 
    // Draw
    // ...
  }`;

const SANDPACK_COLLISIONS = `// Collisions + mouse push - hover to interact
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const GRAVITY = 0.08;
const FRICTION = 0.99;
const WALL_BOUNCE = 0.7;
const PARTICLE_BOUNCE = 0.4;
const R = 6;
const MOUSE_RADIUS = 80;
const MOUSE_FORCE = 8;

let mouseX = -999, mouseY = -999;
canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  mouseX = e.clientX - r.left;
  mouseY = e.clientY - r.top;
});
canvas.addEventListener('mouseleave', () => { mouseX = -999; mouseY = -999; });

const particles = [];
for (let i = 0; i < 40; i++) {
  particles.push({
    x: R + Math.random() * (canvas.width - R * 2),
    y: R + Math.random() * (canvas.height * 0.5),
    vx: (Math.random() - 0.5) * 3,
    vy: (Math.random() - 0.5) * 3,
    r: R,
  });
}

// Check every pair of particles for overlap
function resolveCollisions() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d2 = dx * dx + dy * dy;
      const minD = a.r + b.r;

      if (d2 < minD * minD && d2 > 0.001) {
        const d = Math.sqrt(d2);
        const nx = dx / d, ny = dy / d;
        const overlap = minD - d;

        // Push apart equally
        a.x -= nx * overlap * 0.5;
        a.y -= ny * overlap * 0.5;
        b.x += nx * overlap * 0.5;
        b.y += ny * overlap * 0.5;

        // Exchange velocity along the collision normal
        const relV = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
        if (relV > 0) {
          const imp = relV * PARTICLE_BOUNCE;
          a.vx -= imp * nx; a.vy -= imp * ny;
          b.vx += imp * nx; b.vy += imp * ny;
        }
      }
    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Same physics as before - gravity, friction, walls
  for (const p of particles) {
    p.vy += GRAVITY;
    p.vx *= FRICTION;
    p.vy *= FRICTION;

    // Mouse push
    if (mouseX > 0) {
      const dx = p.x - mouseX, dy = p.y - mouseY;
      const d2 = dx * dx + dy * dy;
      if (d2 < MOUSE_RADIUS * MOUSE_RADIUS && d2 > 1) {
        const d = Math.sqrt(d2);
        const f = ((MOUSE_RADIUS - d) / MOUSE_RADIUS) * MOUSE_FORCE;
        p.vx += (dx / d) * f;
        p.vy += (dy / d) * f;
      }
    }

    p.x += p.vx;
    p.y += p.vy;

    if (p.y + p.r > canvas.height) { p.y = canvas.height - p.r; p.vy *= -WALL_BOUNCE; }
    if (p.x + p.r > canvas.width)  { p.x = canvas.width - p.r;  p.vx *= -WALL_BOUNCE; }
    if (p.x - p.r < 0)             { p.x = p.r;                 p.vx *= -WALL_BOUNCE; }
    if (p.y - p.r < 0)             { p.y = p.r;                 p.vy *= -WALL_BOUNCE; }
  }

  // Resolve collisions (twice for stability)
  resolveCollisions();
  resolveCollisions();

  // Draw mouse radius
  if (mouseX > 0) {
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, MOUSE_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(59,130,246,0.15)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Draw particles
  for (const p of particles) {
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    const t = Math.min(speed / 6, 1);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r - 0.5, 0, Math.PI * 2);
    ctx.fillStyle = \`rgba(59, \${Math.round(100 + t * 30)}, \${Math.round(210 + t * 36)}, \${(0.4 + t * 0.4).toFixed(2)})\`;
    ctx.fill();
  }

  // Collision lines
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < (a.r + b.r + 2) * (a.r + b.r + 2)) {
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = 'rgba(251,191,36,0.25)'; ctx.lineWidth = 0.5; ctx.stroke();
      }
    }
  }

  ctx.fillStyle = 'rgba(134,126,142,0.5)';
  ctx.font = '11px monospace';
  ctx.fillText('hover to push · particles: ' + particles.length, 8, 16);

  requestAnimationFrame(animate);
}
animate();
`;

const SANDPACK_FLUID = `// Fluid sim - hover to push, click+hold to pour
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const GRAVITY = 0.08;
const FRICTION = 0.98;
const BOUNCE = 0.4;
const R = 4;
const CELL = R * 2;
const MOUSE_R = 80;
const MOUSE_F = 8;

let mouseX = -999, mouseY = -999, pouring = false;
canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  mouseX = e.clientX - r.left; mouseY = e.clientY - r.top;
});
canvas.addEventListener('mouseleave', () => { mouseX = -999; pouring = false; });
canvas.addEventListener('mousedown', () => { pouring = true; });
canvas.addEventListener('mouseup', () => { pouring = false; });

const particles = [];
for (let i = 0; i < 60; i++) {
  particles.push({
    x: R + Math.random() * (canvas.width - R * 2),
    y: R + Math.random() * (canvas.height * 0.5),
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2, r: R,
  });
}

// Spatial hash for fast collision detection
const grid = new Map();
function hashKey(cx, cy) { return cx * 73856093 ^ cy * 19349669; }

function buildGrid() {
  grid.clear();
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const k = hashKey(Math.floor(p.x / CELL), Math.floor(p.y / CELL));
    if (grid.has(k)) grid.get(k).push(i); else grid.set(k, [i]);
  }
}

function resolveCollisions() {
  for (let i = 0; i < particles.length; i++) {
    const a = particles[i];
    const cx = Math.floor(a.x / CELL), cy = Math.floor(a.y / CELL);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const bucket = grid.get(hashKey(cx + dx, cy + dy));
        if (!bucket) continue;
        for (const j of bucket) {
          if (j <= i) continue;
          const b = particles[j];
          const ddx = b.x - a.x, ddy = b.y - a.y;
          const d2 = ddx * ddx + ddy * ddy;
          const minD = a.r + b.r;
          if (d2 < minD * minD && d2 > 0.001) {
            const d = Math.sqrt(d2);
            const nx = ddx / d, ny = ddy / d;
            const overlap = minD - d;
            a.x -= nx * overlap * 0.5; a.y -= ny * overlap * 0.5;
            b.x += nx * overlap * 0.5; b.y += ny * overlap * 0.5;
            const relV = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
            if (relV > 0) {
              const imp = relV * BOUNCE;
              a.vx -= imp * nx; a.vy -= imp * ny;
              b.vx += imp * nx; b.vy += imp * ny;
            }
          }
        }
      }
    }
  }
}

function animate() {
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Pour mode
  if (pouring && mouseX > 0 && particles.length < 300) {
    for (let i = 0; i < 2; i++) {
      particles.push({
        x: mouseX + (Math.random() - 0.5) * 6, y: mouseY,
        vx: (Math.random() - 0.5) * 1, vy: 0.5 + Math.random() * 1.2, r: R,
      });
    }
  }

  for (const p of particles) {
    p.vy += GRAVITY; p.vx *= FRICTION; p.vy *= FRICTION;
    if (!pouring && mouseX > 0) {
      const dx = p.x - mouseX, dy = p.y - mouseY;
      const d2 = dx * dx + dy * dy;
      if (d2 < MOUSE_R * MOUSE_R && d2 > 1) {
        const d = Math.sqrt(d2);
        const f = ((MOUSE_R - d) / MOUSE_R) * MOUSE_F;
        p.vx += (dx / d) * f; p.vy += (dy / d) * f;
      }
    }
    p.x += p.vx; p.y += p.vy;
    if (p.x - p.r < 0) { p.x = p.r; p.vx *= -0.3; }
    if (p.x + p.r > w) { p.x = w - p.r; p.vx *= -0.3; }
    if (p.y - p.r < 0) { p.y = p.r; p.vy *= -0.3; }
    if (p.y + p.r > h) { p.y = h - p.r; p.vy *= -0.3; }
  }

  buildGrid(); resolveCollisions();
  buildGrid(); resolveCollisions();

  for (const p of particles) {
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    const t = Math.min(speed / 6, 1);
    const b = Math.round(210 + t * 36);
    const alpha = 0.4 + t * 0.4;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r - 0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(59, ' + Math.round(100 + t * 30) + ', ' + b + ', ' + alpha.toFixed(2) + ')';
    ctx.fill();
  }

  if (mouseX > 0 && !pouring) {
    ctx.beginPath(); ctx.arc(mouseX, mouseY, MOUSE_R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(59,130,246,0.15)'; ctx.lineWidth = 1; ctx.stroke();
  }

  ctx.fillStyle = 'rgba(134,126,142,0.5)'; ctx.font = '11px monospace';
  ctx.fillText('hover: push · click+hold: pour · particles: ' + particles.length, 8, 16);
  requestAnimationFrame(animate);
}
animate();
`;

const DIFF_FLUID = `  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
 
+function resize() {
+  canvas.width = canvas.clientWidth;
+  canvas.height = canvas.clientHeight;
+}
+resize();
+window.addEventListener('resize', resize);
 
  const GRAVITY = 0.08;
  const FRICTION = 0.98;
  const BOUNCE = 0.4;
  const R = 4;
  const particles = [];
 
+// Spawn 120 particles instead of 40
+for (let i = 0; i < 120; i++) {
    particles.push({
      x: R + Math.random() * (canvas.width - R * 2),
      y: R + Math.random() * (canvas.height * 0.5),
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      r: R,
    });
  }
 
  function resolveCollisions() {
    // ...same as before...
  }
 
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
 
    for (const p of particles) {
      p.vy += GRAVITY;
      p.vx *= FRICTION; p.vy *= FRICTION;
      p.x += p.vx; p.y += p.vy;
      // ...wall bouncing...
    }
 
    resolveCollisions();
    resolveCollisions();
 
+  // Velocity-based color - faster particles glow brighter
+  for (const p of particles) {
+    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
+    const t = Math.min(speed / 6, 1);
+    const b = Math.round(210 + t * 36);
+    const alpha = 0.4 + t * 0.4;
+    ctx.beginPath();
+    ctx.arc(p.x, p.y, p.r - 0.5, 0, Math.PI * 2);
+    ctx.fillStyle = \\\`rgba(59, \\\${Math.round(100+t*30)}, \\\${b}, \\\${alpha.toFixed(2)})\\\`;
+    ctx.fill();
+  }
 
+  // HUD
+  ctx.fillStyle = 'rgba(134,126,142,0.5)';
+  ctx.font = '11px monospace';
+  ctx.fillText('particles: ' + particles.length, 8, 16);
 
    requestAnimationFrame(animate);
  }
  animate();`;

const DIFF_SVG_MASK = `+const off = document.createElement('canvas');
+const octx = off.getContext('2d');
+const MASK_TEXT = 'FLUID';
+const FONT_SIZE = 90;
 
  // Particles with life/death cycle
  for (const p of particles) {
+   p.life++;
+   if (p.life >= p.maxLife) particles.splice(i, 1);
  }
 
+// Step 1: Draw particles onto offscreen canvas
+octx.clearRect(0, 0, off.width, off.height);
+octx.globalCompositeOperation = 'source-over';
  for (const p of particles) {
+   octx.beginPath();
+   octx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
+   octx.fillStyle = \\\`rgba(59,130,246,\\\${(a*0.8).toFixed(2)})\\\`;
+   octx.fill();
  }
 
+// Step 2: Mask - keep only pixels inside text
+octx.globalCompositeOperation = 'destination-in';
+octx.font = \\\`bold \\\${FONT_SIZE}px Inter, sans-serif\\\`;
+octx.textAlign = 'center';
+octx.textBaseline = 'middle';
+octx.fillStyle = 'white';
+octx.fillText(MASK_TEXT, off.width / 2, off.height / 2);
 
+// Step 3: Draw text outline on main canvas
+ctx.strokeStyle = 'rgba(59,130,246,0.12)';
+ctx.strokeText(MASK_TEXT, canvas.width / 2, canvas.height / 2);
 
+// Step 4: Stamp masked particles onto main canvas
+ctx.drawImage(off, 0, 0);`;

const SANDPACK_SVG_MASK = `// Canvas text masking - offscreen compositing
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  off.width = canvas.width;
  off.height = canvas.height;
}

// Offscreen canvas for particle compositing
const off = document.createElement('canvas');
const octx = off.getContext('2d');
resize();
window.addEventListener('resize', resize);

const MASK_TEXT = 'FLUID';
const FONT_SIZE = 90;
const particles = [];

function spawn() {
  particles.push({
    x: Math.random() * canvas.width,
    y: canvas.height + 5,
    vx: (Math.random() - 0.5) * 0.5,
    vy: -(0.5 + Math.random() * 1.5),
    life: 0,
    maxLife: 120 + Math.random() * 60,
    size: 1.5 + Math.random() * 2.5,
  });
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (particles.length < 300) spawn();

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy;
    p.vx += (Math.random() - 0.5) * 0.04;
    p.life++;
    if (p.life >= p.maxLife) particles.splice(i, 1);
  }

  // ── Step 1: Draw particles onto offscreen canvas ──
  octx.clearRect(0, 0, off.width, off.height);
  octx.globalCompositeOperation = 'source-over';
  for (const p of particles) {
    const t = p.life / p.maxLife;
    const a = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
    if (a <= 0) continue;
    octx.beginPath();
    octx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    octx.fillStyle = \`rgba(59,130,246,\${(a*0.8).toFixed(2)})\`;
    octx.fill();
  }

  // ── Step 2: Mask - keep only particles inside text ──
  // destination-in erases everything outside the text shape
  octx.globalCompositeOperation = 'destination-in';
  octx.font = \`bold \${FONT_SIZE}px Inter, sans-serif\`;
  octx.textAlign = 'center';
  octx.textBaseline = 'middle';
  octx.fillStyle = 'white';
  octx.fillText(MASK_TEXT, off.width / 2, off.height / 2);

  // ── Step 3: Draw text outline on main canvas ──
  ctx.font = \`bold \${FONT_SIZE}px Inter, sans-serif\`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.strokeStyle = 'rgba(59,130,246,0.12)';
  ctx.lineWidth = 1;
  ctx.strokeText(MASK_TEXT, canvas.width / 2, canvas.height / 2);

  // ── Step 4: Composite masked particles onto main canvas ──
  ctx.drawImage(off, 0, 0);

  requestAnimationFrame(animate);
}
animate();
`;

const SANDPACK_HTML = `<!DOCTYPE html>
<html style="margin:0;padding:0;height:100%;background:#16171d;">
<head><style>*{margin:0;padding:0;box-sizing:border-box;}html,body{height:100%;overflow:hidden;background:#16171d;}</style></head>
<body><canvas id="canvas" style="display:block;width:100%;height:100%;"></canvas></body>
</html>`;

/* ═══════════════════════════════════════════════════════
   CODE SANDBOX WRAPPER
   ═══════════════════════════════════════════════════════ */
function CodeSandbox({ code, title }: { code: string; title: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="my-8 border border-nickel overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full px-4 py-2.5 border-b border-nickel flex items-center gap-3 cursor-pointer"
                style={{ background: "rgba(255,255,255,0.02)" }}
            >
                <span className="text-[10px] font-mono text-grey/50 tracking-widest uppercase">sandbox · {title}</span>
                <span className="flex items-center gap-3 ml-auto">
                    <span className="text-[10px] font-mono text-ruby/40">editable</span>
                    <span className="text-[10px] font-mono text-grey/30">{open ? "hide" : "show"}</span>
                </span>
            </button>
            {open && <Sandpack
                template="vanilla"
                files={{ "/index.js": code, "/index.html": SANDPACK_HTML }}
                options={{ showLineNumbers: true, showTabs: false, editorHeight: 380, editorWidthPercentage: 55 }}
                theme={{
                    colors: {
                        surface1: "#16171d", surface2: "#1e1f27", surface3: "#2a2b35",
                        clickable: "#867e8e", base: "#867e8e", disabled: "#3B3440",
                        hover: "#3B82F6", accent: "#3B82F6", error: "#EF4444", errorSurface: "#2d1518",
                    },
                    syntax: {
                        plain: "#d4d4d8", comment: { color: "#6b7280", fontStyle: "italic" },
                        keyword: "#c084fc", tag: "#22d3ee", punctuation: "#6b7280",
                        definition: "#3B82F6", property: "#93c5fd", static: "#FBBF24", string: "#86efac",
                    },
                    font: {
                        body: '"Cascadia Code", "Fira Code", ui-monospace, monospace',
                        mono: '"Cascadia Code", "Fira Code", ui-monospace, monospace',
                        size: "13px", lineHeight: "1.6",
                    },
                }}
            />}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   TABLE OF CONTENTS
   ═══════════════════════════════════════════════════════ */
const TOC = [
    { id: "intro", label: "Introduction" },
    { id: "position-velocity", label: "Position & Velocity" },
    { id: "forces", label: "Forces & Drag" },
    { id: "collisions", label: "Collisions" },
    { id: "spatial-hash", label: "Spatial Hashing" },
    { id: "full-sim", label: "The Full Simulation" },
    { id: "text-masking", label: "Canvas Text Masking" },
    { id: "conclusion", label: "What's Next" },
];

function TableOfContents() {
    const [active, setActive] = useState("");

    const handleScroll = useCallback(() => {
        for (let i = TOC.length - 1; i >= 0; i--) {
            const el = document.getElementById(TOC[i].id);
            if (el && el.getBoundingClientRect().top < 150) { setActive(TOC[i].id); return; }
        }
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    return (
        <nav className="hidden xl:flex flex-col gap-1 sticky top-24">
            <span className="text-[10px] font-mono text-grey/40 tracking-widest uppercase mb-2">contents</span>
            {TOC.map((item) => (
                <a key={item.id} href={`#${item.id}`}
                    className="text-xs font-mono py-1 transition-colors no-underline"
                    style={{
                        color: active === item.id ? "#3B82F6" : "rgba(134,126,142,0.5)",
                        paddingLeft: active === item.id ? "8px" : "12px",
                        borderLeft: active === item.id ? "2px solid #3B82F6" : "2px solid transparent",
                    }}>
                    {item.label}
                </a>
            ))}
        </nav>
    );
}

function ReadingProgress() {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        const onScroll = () => {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    return (
        <div className="fixed top-0 left-0 right-0 z-50 h-0.5" style={{ background: "rgba(22,23,29,0.5)" }}>
            <div className="h-full transition-all duration-150" style={{ width: `${progress}%`, background: "#3B82F6" }} />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   M A I N   B L O G   P O S T   P A G E
   ═══════════════════════════════════════════════════════ */
export default function BlogPost() {
    useEffect(() => { window.scrollTo(0, 0); }, []);

    return (
        <div className="min-h-screen bg-primary">
            <div className="scanline-overlay" />
            <div className="dot-grid-overlay" />
            <ReadingProgress />
            <BlogNav />

            {/* Hero */}
            <header className="wrapper border-b border-nickel">
                <div className="px-5 sm:px-10 py-16 sm:py-24">
                    <div className="flex items-center gap-3 mb-6 flex-wrap">
                        {["Physics", "Canvas", "Collisions", "Spatial Hash", "Interactive"].map(t => (
                            <span key={t} className="text-[10px] font-mono tracking-wider uppercase border border-nickel/60 px-2 py-0.5 text-grey/60">{t}</span>
                        ))}
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-medium text-white leading-tight mb-4">
                        Building a Fluid Particle System From Scratch
                    </h1>
                    <p className="text-grey text-base sm:text-lg leading-relaxed mb-10">
                        How the particle field on this website works - from basic Newtonian physics and rigid-body collisions to spatial hash grids, mouse interaction, and canvas text masking. Every concept has a live demo.
                    </p>
                    <div className="flex items-center gap-4 text-xs font-mono text-grey/40 pt-4">
                        <span>2026-03-15</span>
                        <span className="text-grey/20">·</span>
                        <span>22 min read</span>
                        <span className="text-grey/20">·</span>
                        <span>Blaz Peric</span>
                    </div>
                </div>
            </header>

            {/* Body */}
            <div className="wrapper">
                <div className="flex">
                    <aside className="hidden xl:block w-56 shrink-0 border-r border-nickel px-5 py-10">
                        <TableOfContents />
                    </aside>

                    <article className="flex-1 min-w-0 px-5 sm:px-10 lg:px-16 py-10">

                        {/* ── 00: Introduction ── */}
                        <section id="intro" className="mb-16">
                            <SectionHeading number="00" title="What is a Particle System?" />
                            <p className="text-grey text-sm leading-relaxed mb-4">
                                Interactive particle systems are a staple of modern web design. They make interfaces feel alive. But under the hood, they are just a continuous loop of basic physics and math. In this post, we're going to build a performant particle simulator from scratch using React and the HTML5 Canvas API.
                            </p>
                            <p className="text-grey text-sm leading-relaxed mb-4">
                                The particle field on this website's homepage is the end result - 900 particles with gravity, collisions, mouse interaction, and velocity-based coloring running at 60fps. We'll build up to it from a single bouncing dot.
                            </p>
                            <Note type="info">
                                The concept was pioneered by <strong className="text-white">William Reeves</strong> at Lucasfilm in 1983 for the "Genesis effect" in <em>Star Trek II</em>. The same principles still power particles in game engines, VFX software, and web animations today.
                            </Note>
                            <p className="text-grey text-sm leading-relaxed">
                                Every section has interactive demos you can tweak, and collapsible code sandboxes you can modify in real-time.
                            </p>
                        </section>

                        {/* ── 01: Position & Velocity ── */}
                        <section id="position-velocity" className="mb-16">
                            <SectionHeading number="01" title="The Core Engine: Position & Velocity" subtitle="Creating the heartbeat of our simulation" />
                            <p className="text-grey text-sm leading-relaxed mb-4">
                                Every particle simulator relies on an animation loop. At its most basic, a particle is just a point in space <code className="text-ruby/70 text-xs bg-ruby/5 px-1.5 py-0.5">(x, y)</code>. That's it. A dot on a canvas:
                            </p>

                            <StaticBallDemo />

                            <CodeSandbox code={SANDPACK_STATIC_BALL} title="a particle at rest" />

                            <p className="text-grey text-sm leading-relaxed mb-4">
                                To make it move, we give it velocity <code className="text-ruby/70 text-xs bg-ruby/5 px-1.5 py-0.5">(vx, vy)</code>. Every time our screen repaints (using <code className="text-ruby/70 text-xs bg-ruby/5 px-1.5 py-0.5">requestAnimationFrame</code>), we add the velocity to the position:
                            </p>

                            <Equation label="Motion">
                                <span className="text-ruby/70">x</span> += <span className="text-cyan-400/70">vx</span>
                                <span className="text-grey/30 mx-4">│</span>
                                <span className="text-ruby/70">y</span> += <span className="text-cyan-400/70">vy</span>
                            </Equation>

                            <p className="text-grey text-sm leading-relaxed mb-4">
                                Watch the yellow arrow - it's the velocity vector. Because no forces are acting on the ball, it never changes direction or length. The ball moves in a perfectly straight line and flies off the edge:
                            </p>

                            <VelocityDemo />

                            <CodeSandbox code={SANDPACK_VELOCITY} title="velocity without walls" />

                            <Note type="tip">
                                Notice how the velocity vector (the yellow arrow) stays <strong className="text-white">exactly the same</strong> every frame. In a perfect vacuum with no walls, an object in motion stays in motion forever. This is Newton's first law.
                            </Note>

                            <p className="text-grey text-sm leading-relaxed mb-4">
                                Obviously we don't want particles disappearing forever. When a particle crosses a wall boundary, we clamp its position back inside and reverse the velocity component that hit the wall. A damping factor controls how much energy survives the bounce:
                            </p>

                            <Equation label="Wall Bounce">
                                <span className="text-grey/50">if hit wall:</span>
                                <span className="text-cyan-400/70 ml-2">v</span> = -<span className="text-cyan-400/70">v</span> × <span className="text-amber-400/70">WALL_BOUNCE</span>
                                <span className="text-grey/30 mx-4">=</span>
                                -<span className="text-cyan-400/70">v</span> × <span className="text-amber-400/70">0.7</span>
                            </Equation>

                            <WallBounceDemo />

                            <Note type="tip">
                                Now the yellow arrow <strong className="text-white">does</strong> change - it shrinks and flips on every wall hit. The red flash indicates which wall was hit. Try setting gravity to <strong className="text-white">0</strong> and friction to <strong className="text-white">0%</strong> - the ball will bounce forever without losing energy. Click anywhere to reset.
                            </Note>

                            <CodeSandbox code={SANDPACK_BASIC_PARTICLE} title="single ball on canvas" />
                        </section>

                        {/* ── 02: Forces & Drag ── */}
                        <section id="forces" className="mb-16">
                            <SectionHeading number="02" title="Adding Realism: Forces & Drag" subtitle="Because the real world isn't a vacuum" />
                            <p className="text-grey text-sm leading-relaxed mb-4">
                                Basic movement is great, but it feels robotic. To make our particles feel natural, we need to apply forces.
                            </p>

                            <ul className="text-grey text-sm leading-relaxed mb-6 space-y-2 ml-4">
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400 shrink-0">▸</span>
                                    <span><strong className="text-amber-400">Gravity</strong> - a constant downward force that increases <code className="text-amber-400/70 text-xs bg-amber-400/5 px-1.5 py-0.5">vy</code> every frame. In our sim, that's <code className="text-amber-400/70 text-xs bg-amber-400/5 px-1.5 py-0.5">vy += 0.08</code>.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-400 shrink-0">▸</span>
                                    <span><strong className="text-red-400">Friction (Drag)</strong> - a force that slowly reduces both <code className="text-red-400/70 text-xs bg-red-400/5 px-1.5 py-0.5">vx</code> and <code className="text-red-400/70 text-xs bg-red-400/5 px-1.5 py-0.5">vy</code> over time, simulating air resistance. We multiply velocity by <code className="text-red-400/70 text-xs bg-red-400/5 px-1.5 py-0.5">0.98</code> each frame - a 2% speed loss.</span>
                                </li>
                            </ul>

                            <Equation label="Forces">
                                <span className="text-cyan-400/70">vy</span> += <span className="text-amber-400/70">GRAVITY</span>
                                <span className="text-grey/30 mx-4">│</span>
                                <span className="text-cyan-400/70">vx</span> *= <span className="text-red-400/70">FRICTION</span>
                                <span className="text-grey/30 mx-4">│</span>
                                <span className="text-cyan-400/70">vy</span> *= <span className="text-red-400/70">FRICTION</span>
                            </Equation>

                            <ForceDiagram />

                            <Note type="physics">
                                <strong className="text-amber-400">Newton's Second Law:</strong> F = ma. Since our particles have mass = 1, force equals acceleration directly. That's why we add force values straight to velocity.
                            </Note>

                            <p className="text-grey text-sm leading-relaxed mb-4">
                                Our <code className="text-blue-400/70 text-xs bg-blue-400/5 px-1.5 py-0.5">ParticleField</code> also adds a <strong className="text-blue-400">mouse force</strong> - a radial push within a 100px radius. The closer a particle is to the cursor, the harder it gets pushed:
                            </p>

                            <Equation label="Mouse Push">
                                <span className="text-grey/50">if dist &lt; R:</span>
                                <span className="text-cyan-400/70 ml-2">vx</span> += <span className="text-blue-400/70">(dx / dist) × ((R - dist) / R) × FORCE</span>
                            </Equation>

                            <CodeSandbox code={SANDPACK_FORCES} title="forces & drag" />
                        </section>

                        {/* ── 03: Collisions ── */}
                        <section id="collisions" className="mb-16">
                            <SectionHeading number="03" title="The Hard Part: Collisions" subtitle="Making particles aware of each other" />
                            <p className="text-grey text-sm leading-relaxed mb-4">
                                Right now, our particles are ghosts - they pass right through each other. To fix this, we need to check for collisions. For circles, the math is relatively straightforward: if the distance between the center points of two particles is less than the sum of their radii, they are colliding.
                            </p>
                            <p className="text-grey text-sm leading-relaxed mb-4">
                                When they collide, we resolve it in two steps:
                            </p>

                            <div className="my-6 space-y-4">
                                <div className="flex gap-4 items-start">
                                    <span className="shrink-0 w-7 h-7 flex items-center justify-center border border-ruby/30 text-ruby text-xs font-mono" style={{ background: "rgba(59,130,246,0.06)" }}>1</span>
                                    <div>
                                        <div className="text-white text-sm font-medium">Position correction</div>
                                        <div className="text-grey text-xs mt-0.5">Push both particles apart by half the overlap distance along the collision normal. This prevents them from sinking into each other.</div>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <span className="shrink-0 w-7 h-7 flex items-center justify-center border border-ruby/30 text-ruby text-xs font-mono" style={{ background: "rgba(59,130,246,0.06)" }}>2</span>
                                    <div>
                                        <div className="text-white text-sm font-medium">Velocity exchange</div>
                                        <div className="text-grey text-xs mt-0.5">Calculate the angle of impact and swap velocities along that axis: <code className="text-ruby/70 text-xs bg-ruby/5 px-1.5 py-0.5">impulse = relVelocity·normal × BOUNCE</code></div>
                                    </div>
                                </div>
                            </div>

                            <Equation label="Normal">
                                <span className="text-cyan-400/70">nx</span> = dx / dist
                                <span className="text-grey/30 mx-4">│</span>
                                <span className="text-cyan-400/70">ny</span> = dy / dist
                            </Equation>
                            <Equation label="Overlap">
                                <span className="text-amber-400/70">overlap</span> = (radius_a + radius_b) - <span className="text-cyan-400/70">dist</span>
                            </Equation>
                            <Equation label="Impulse">
                                <span className="text-red-400/70">impulse</span> = (<span className="text-cyan-400/70">relVx</span>·nx + <span className="text-cyan-400/70">relVy</span>·ny) × <span className="text-amber-400/70">BOUNCE</span>
                            </Equation>

                            <CollisionDemo />

                            <Note type="physics">
                                To prevent particles from merging into each other, we don't just change their velocity - we also mathematically separate them by pushing them apart based on the overlap distance. We run this resolution <strong className="text-white">twice per frame</strong> (<code className="text-ruby/70 text-xs bg-ruby/5 px-1.5 py-0.5">COLLISION_ITERS = 2</code>) since a single pass can leave overlaps when resolving one pair pushes particles into another. This is the same technique used in game physics engines like Box2D.
                            </Note>

                            <p className="text-grey text-sm leading-relaxed mb-4 mt-8">
                                Here's what changed from our single-ball code. The dimmed lines are the same as before - the highlighted lines are everything we added to get collisions working:
                            </p>
                            <DiffBlock code={DIFF_COLLISIONS} title="single ball → collisions" />

                            <p className="text-grey text-sm leading-relaxed mb-4">
                                Try it live - change <code className="text-ruby/70 text-xs bg-ruby/5 px-1.5 py-0.5">PARTICLE_BOUNCE</code> or the particle count to feel the difference:
                            </p>
                            <CodeSandbox code={SANDPACK_COLLISIONS} title="collision sandbox" />
                        </section>

                        {/* ── 04: Spatial Hashing ── */}
                        <section id="spatial-hash" className="mb-16">
                            <SectionHeading number="04" title="Scaling Up: Spatial Hashing" subtitle="Fixing the performance bottleneck" />
                            <p className="text-grey text-sm leading-relaxed mb-4">
                                If you spawn 1,000 particles using the collision logic above, your browser will likely freeze. Why? Because checking every particle against every other particle scales at <code className="text-ruby/70 text-xs bg-ruby/5 px-1.5 py-0.5">O(n²)</code>. For 1,000 particles, that's nearly <strong className="text-white">1,000,000</strong> distance checks per frame.
                            </p>
                            <p className="text-grey text-sm leading-relaxed mb-4">
                                The key insight: we don't need to check particles on the left side of the screen against particles on the right side. We can optimize this by dividing our canvas into a grid. This technique is called a <strong className="text-white">Spatial Hash</strong>.
                            </p>

                            <div className="my-6 border border-nickel overflow-hidden">
                                <div className="grid grid-cols-3 text-[10px] font-mono tracking-wider uppercase text-grey/40 border-b border-nickel">
                                    <div className="px-4 py-2.5 border-r border-nickel/40">approach</div>
                                    <div className="px-4 py-2.5 border-r border-nickel/40">checks / frame</div>
                                    <div className="px-4 py-2.5">complexity</div>
                                </div>
                                {[
                                    { a: "Brute force", b: "~405,000", c: "O(n²)", color: "#EF4444" },
                                    { a: "Spatial hash", b: "~5,000-15,000", c: "O(n × k)", color: "#3B82F6" },
                                ].map(row => (
                                    <div key={row.a} className="grid grid-cols-3 text-xs border-b border-nickel/20 last:border-0">
                                        <div className="px-4 py-3 font-mono border-r border-nickel/40" style={{ color: row.color }}>{row.a}</div>
                                        <div className="px-4 py-3 text-grey/60 font-mono border-r border-nickel/40">{row.b}</div>
                                        <div className="px-4 py-3 text-grey/60 font-mono">{row.c}</div>
                                    </div>
                                ))}
                            </div>

                            <p className="text-grey text-sm leading-relaxed mb-4">
                                Instead of checking every particle, each particle registers which grid cell it occupies. When checking for collisions, it only looks at particles in its own cell and the <strong className="text-white">8 neighbors</strong> - a 3×3 search area instead of the entire canvas. The hash function uses large primes to distribute cells evenly: <code className="text-ruby/70 text-xs bg-ruby/5 px-1.5 py-0.5">key = cx × 73856093 + cy × 19349663</code>.
                            </p>

                            <SpatialHashDemo />

                            <Note type="tip">
                                Hover over a cell to see which particles the spatial hash would check (blue) vs. skip (grey). Notice the counter - with 80 particles, typically only 5-15 are in the 3×3 neighborhood. That's a <strong className="text-white">90%+ reduction</strong> in collision checks.
                            </Note>

                            <CodeSandbox code={SANDPACK_SPATIAL_HASH} title="spatial hash grid" />
                        </section>

                        {/* ── 05: The Full Simulation ── */}
                        <section id="full-sim" className="mb-16">
                            <SectionHeading number="05" title="The Full Fluid Simulation" subtitle="Putting it all together - 900 particles" />
                            <p className="text-grey text-sm leading-relaxed mb-4">
                                Now we combine everything - position, forces, collisions, and spatial hashing - into a single animation loop. Here's the complete frame cycle from <code className="text-blue-400/70 text-xs bg-blue-400/5 px-1.5 py-0.5">ParticleField.tsx</code>:
                            </p>

                            <div className="my-6 space-y-3">
                                {[
                                    { step: "1", title: "Spawn drip particles", desc: "If mouse is held (pouring mode), spawn 3 particles/frame at cursor position with slight downward velocity" },
                                    { step: "2", title: "Apply forces", desc: "Gravity (vy += 0.08), mouse push (radial if hovering), friction (v *= 0.98)" },
                                    { step: "3", title: "Integrate", desc: "position += velocity for each particle" },
                                    { step: "4", title: "Wall containment", desc: "Clamp to canvas bounds, reverse velocity with 0.3 bounce factor" },
                                    { step: "5", title: "Build spatial hash", desc: "Clear grid, assign every particle to its cell" },
                                    { step: "6", title: "Resolve collisions ×2", desc: "For each particle, check 3×3 neighborhood. Push apart + exchange velocity." },
                                    { step: "7", title: "Re-clamp", desc: "Collisions can push particles outside walls - clamp again" },
                                    { step: "8", title: "Draw", desc: "Map speed → color, draw each particle as a filled circle" },
                                ].map(s => (
                                    <div key={s.step} className="flex gap-4 items-start">
                                        <span className="shrink-0 w-7 h-7 flex items-center justify-center border border-ruby/30 text-ruby text-xs font-mono" style={{ background: "rgba(59,130,246,0.06)" }}>{s.step}</span>
                                        <div>
                                            <div className="text-white text-sm font-medium">{s.title}</div>
                                            <div className="text-grey text-xs mt-0.5">{s.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="text-grey text-sm leading-relaxed mb-4">
                                The particle field has two mouse behaviors - <strong className="text-blue-400">hover to push</strong> (radial force within 100px) and <strong className="text-ruby">click and hold to pour</strong> (spawns 3 particles/frame at the cursor). Push is disabled while pouring so the drip flows naturally downward.
                            </p>

                            <p className="text-grey text-sm leading-relaxed mb-4">
                                Every particle's color is a function of its speed. Slow particles are dim; fast ones are bright. This creates <strong className="text-white">instant visual feedback</strong> - you can "see" the physics.
                            </p>

                            <Equation label="Color">
                                <span className="text-grey/50">t = min(speed / 8, 1)</span>
                                <span className="text-grey/30 mx-3">→</span>
                                <span className="text-cyan-400/70">rgb</span> = <span className="text-grey/60">accent × (0.25 + t × 0.75)</span>
                            </Equation>

                            <Note type="info">
                                The particle count (900) and radius (4px) were tuned by trial and error. Fewer particles look sparse; more particles tank performance. We use <code className="text-white/70 text-xs">Math.min(devicePixelRatio, 2)</code> to cap DPR on Retina screens.
                            </Note>

                            <FluidDemo />

                            <p className="text-grey text-sm leading-relaxed mb-4">
                                What changed from our collision code - we added resize handling, more particles, and velocity-based coloring:
                            </p>
                            <DiffBlock code={DIFF_FLUID} title="collisions → fluid sim" />
                            <CodeSandbox code={SANDPACK_FLUID} title="fluid particle sim" />
                        </section>

                        {/* ── 06: Canvas Text Masking ── */}
                        <section id="text-masking" className="mb-16">
                            <SectionHeading number="06" title="Canvas Text Masking" subtitle="Confining particles inside arbitrary shapes" />
                            <p className="text-grey text-sm leading-relaxed mb-4">
                                A bonus technique: what if particles were only visible <em>inside a text shape</em>? The naive approach - drawing text on the main canvas and using <code className="text-white/70 text-xs">source-in</code> - has problems: outline strokes accumulate each frame and the text fill obscures the particles. The fix is an <strong className="text-white">offscreen canvas</strong>:
                            </p>

                            <div className="my-6 space-y-3">
                                {[
                                    { step: "1", title: "Draw particles offscreen", desc: "Render all particles onto a separate offscreen canvas with normal compositing" },
                                    { step: "2", title: "Mask with destination-in", desc: "Draw the text shape on the offscreen canvas with destination-in - everything outside the text is erased" },
                                    { step: "3", title: "Outline on main canvas", desc: "strokeText directly on the main canvas (clean, single stroke per frame, no accumulation)" },
                                    { step: "4", title: "Composite result", desc: "drawImage the masked offscreen canvas onto the main canvas - particles appear inside the text" },
                                ].map(s => (
                                    <div key={s.step} className="flex gap-4 items-start">
                                        <span className="shrink-0 w-7 h-7 flex items-center justify-center border border-ruby/30 text-ruby text-xs font-mono" style={{ background: "rgba(59,130,246,0.06)" }}>{s.step}</span>
                                        <div>
                                            <div className="text-white text-sm font-medium">{s.title}</div>
                                            <div className="text-grey text-xs mt-0.5">{s.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <SvgMaskDemo />

                            <Note type="info">
                                Canvas compositing is powerful but tricky. <code className="text-white/70 text-xs">destination-in</code> keeps existing pixels only where new content overlaps - perfect for masking. Using an offscreen canvas avoids contaminating the main canvas's compositing state.
                            </Note>

                            <DiffBlock code={DIFF_SVG_MASK} title="masking additions" />

                            <p className="text-grey text-sm leading-relaxed mb-4 mt-8">
                                Full editable sandbox - try changing <code className="text-white/70 text-xs">MASK_TEXT</code>, <code className="text-white/70 text-xs">FONT_SIZE</code>, or the particle color:
                            </p>
                            <CodeSandbox code={SANDPACK_SVG_MASK} title="text masking" />
                        </section>

                        {/* ── 07: Conclusion ── */}
                        <section id="conclusion" className="mb-16">
                            <SectionHeading number="07" title="What's Next" />
                            <p className="text-grey text-sm leading-relaxed mb-4">
                                Building a physics engine from scratch is an incredible way to understand performance, math, and rendering on the web. By combining simple rules - velocity, forces, geometry, and clever data structures like spatial hashes - we can create complex, beautiful, and highly performant interactive systems.
                            </p>
                            <p className="text-grey text-sm leading-relaxed mb-4">
                                Some directions to explore:
                            </p>
                            <ul className="text-grey text-sm leading-relaxed space-y-2 ml-4 mb-6">
                                {[
                                    "Attraction/repulsion - particles that orbit or flee the cursor",
                                    "Particle connections - draw lines between nearby particles (constellation effect)",
                                    "WebGL acceleration - move to GPU for 10,000+ particles via instanced rendering",
                                    "Image sampling - emit particles from pixel positions of a source image",
                                    "Audio reactivity - map particle emission to frequency spectrum data",
                                    "SPH fluid - proper smoothed-particle hydrodynamics for realistic water",
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-ruby/50 shrink-0">▸</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className="border border-nickel p-6 mt-8" style={{ background: "rgba(59,130,246,0.02)" }}>
                                <p className="text-white text-sm font-medium mb-2">Thanks for reading!</p>
                                <p className="text-grey text-xs">
                                    Every interactive demo on this page runs real code in your browser. The full <code className="text-blue-400/70 text-xs bg-blue-400/5 px-1.5 py-0.5">ParticleField.tsx</code> source is available on GitHub. If you build something cool with these techniques, I'd love to see it.
                                </p>
                            </div>
                        </section>

                    </article>
                </div>
            </div>

            {/* Footer */}
            <footer className="wrapper border-t border-nickel">
                <div className="px-5 sm:px-10 py-8 flex items-center justify-between">
                    <a href="/" className="text-xs font-mono text-grey/40 hover:text-white transition-colors no-underline flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Back to home
                    </a>
                    <span className="text-grey/20 text-xs font-mono">blazperic.com</span>
                </div>
            </footer>
        </div>
    );
}
