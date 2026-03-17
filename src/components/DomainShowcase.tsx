import { useEffect, useRef, useState } from "react";
import type { DomainInfo } from "./TrustedBy";

interface DomainShowcaseProps {
    domain: DomainInfo | null;
    defaultHeading: string;
    defaultSubheading: string;
}

// ── Physics config ──
const PARTICLE_COUNT = 900;
const GRAVITY = 0.08;
const FRICTION = 0.98;
const WALL_BOUNCE = 0.3;
const PARTICLE_BOUNCE = 0.4;
const MOUSE_RADIUS = 100;
const MOUSE_FORCE = 12;
const RADIUS = 4;
const DRAW_MIN = 2.0;
const DRAW_MAX = 3.8;
const COLLISION_ITERS = 2;
const MARGIN = 1;
const CELL_SIZE = RADIUS * 4;

// ── Logo definitions: real SVG path data + native viewBox ──
interface LogoDef {
    paths: string[];   // one or more SVG path "d" strings
    vbW: number;       // viewBox width
    vbH: number;       // viewBox height
    stroke?: boolean;  // true = stroke paths instead of fill (for outline icons)
    strokeW?: number;  // stroke-width in viewBox units (default 2)
}

const LOGO_DEFS: Record<string, LogoDef> = {
    // Flutter — flutterLogo.svg (viewBox 0 0 148.9 184.35)
    mobile: {
        paths: [
            "M148.9,85.08,99.27,134.71l49.63,49.64H92.18L70.9,163.08h0L42.54,134.71,92.18,85.08ZM92.18,0,0,92.18l28.37,28.36L148.9,0Z",
        ],
        vbW: 148.9,
        vbH: 184.35,
    },
    // Node.js — nodeJsLogo.svg (viewBox 0 0 32 32)
    backend: {
        paths: [
            "M14.656.427c.8-.453 1.82-.455 2.6 0L29.2 7.16c.747.42 1.247 1.253 1.24 2.114v13.5c.005.897-.544 1.748-1.332 2.16l-11.88 6.702a2.6 2.6 0 0 1-2.639-.073l-3.565-2.06c-.243-.145-.516-.26-.688-.495.152-.204.422-.23.642-.32.496-.158.95-.4 1.406-.656.115-.08.256-.05.366.022l3.04 1.758c.217.125.437-.04.623-.145l11.665-6.583c.144-.07.224-.222.212-.38V9.334c.016-.18-.087-.344-.25-.417L16.19 2.244a.41.41 0 0 0-.465-.001L3.892 8.93c-.16.073-.27.235-.25.415v13.37c-.014.158.07.307.215.375l3.162 1.785c.594.32 1.323.5 1.977.265a1.5 1.5 0 0 0 .971-1.409l.003-13.29c-.014-.197.172-.36.363-.34h1.52c.2-.005.357.207.33.405L12.18 23.88c.001 1.188-.487 2.48-1.586 3.063-1.354.7-3.028.553-4.366-.12l-3.4-1.88c-.8-.4-1.337-1.264-1.332-2.16v-13.5a2.46 2.46 0 0 1 1.282-2.141L14.656.427zM18.1 9.785c1.727-.1 3.576-.066 5.13.785 1.203.652 1.87 2.02 1.892 3.358-.034.18-.222.28-.394.267-.5-.001-1.002.007-1.504-.003-.213.008-.336-.188-.363-.376-.144-.64-.493-1.273-1.095-1.582-.924-.463-1.996-.44-3.004-.43-.736.04-1.527.103-2.15.535-.48.328-.624 1-.453 1.522.16.383.603.506.964.62 2.082.544 4.287.5 6.33 1.207.845.292 1.672.86 1.962 1.745.378 1.186.213 2.604-.63 3.556-.684.784-1.68 1.2-2.675 1.442-1.323.295-2.695.302-4.038.17-1.263-.144-2.577-.476-3.552-1.336-.834-.724-1.24-1.852-1.2-2.94.01-.184.193-.312.37-.297h1.5c.202-.014.35.16.36.35.093.6.322 1.25.854 1.6 1.026.662 2.313.616 3.487.635.973-.043 2.065-.056 2.86-.7.42-.367.543-.98.43-1.508-.123-.446-.6-.653-1-.8-2.055-.65-4.285-.414-6.32-1.15-.826-.292-1.625-.844-1.942-1.693-.443-1.2-.24-2.687.693-3.607.9-.915 2.22-1.268 3.47-1.394z",
        ],
        vbW: 32,
        vbH: 32,
    },
    // AI stars — AiLogo.svg (viewBox 0 0 16 16)
    ai: {
        paths: [
            "M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.73 1.73 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.73 1.73 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z",
        ],
        vbW: 16,
        vbH: 16,
    },
    // Laboratory flask — LabalatoryLogo.svg (viewBox 0 0 24 24, stroke-based)
    research: {
        paths: [
            "M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2",
            "M6.453 15h11.094",
            "M8.5 2h7",
        ],
        vbW: 24,
        vbH: 24,
        stroke: true,
        strokeW: 2,
    },
};

/**
 * Rasterise SVG paths onto an offscreen canvas, then sample filled pixels
 * to produce a point-cloud for particle targets.
 * Aspect-ratio is preserved — logo is centred at (cx, cy) within maxSize.
 */
function sampleLogoPoints(
    def: LogoDef,
    count: number,
    cx: number,
    cy: number,
    maxSize: number,
): { x: number; y: number }[] {
    // Fit inside maxSize keeping aspect ratio
    const aspect = def.vbW / def.vbH;
    let drawW: number, drawH: number;
    if (aspect >= 1) { drawW = maxSize; drawH = maxSize / aspect; }
    else { drawH = maxSize; drawW = maxSize * aspect; }

    const off = document.createElement("canvas");
    const cW = Math.ceil(drawW);
    const cH = Math.ceil(drawH);
    off.width = cW;
    off.height = cH;
    const c = off.getContext("2d")!;

    // Scale from viewBox coords → canvas pixel coords
    const scaleX = drawW / def.vbW;
    const scaleY = drawH / def.vbH;
    c.setTransform(scaleX, 0, 0, scaleY, 0, 0);

    if (def.stroke) {
        // Stroke-based icon (e.g. laboratory flask)
        c.strokeStyle = "#fff";
        c.lineWidth = def.strokeW ?? 2;
        c.lineCap = "round";
        c.lineJoin = "round";
        for (const d of def.paths) {
            const p2d = new Path2D(d);
            c.stroke(p2d);
        }
    } else {
        // Filled icon (default)
        c.fillStyle = "#fff";
        for (const d of def.paths) {
            const p2d = new Path2D(d);
            c.fill(p2d);
        }
    }

    // Read pixels
    c.setTransform(1, 0, 0, 1, 0, 0);
    const img = c.getImageData(0, 0, cW, cH);

    // Collect filled positions → world coords centred on (cx, cy)
    const filled: { x: number; y: number }[] = [];
    const step = Math.max(1, Math.floor(Math.max(cW, cH) / 150));
    const ofsX = cx - drawW / 2;
    const ofsY = cy - drawH / 2;
    for (let y = 0; y < cH; y += step) {
        for (let x = 0; x < cW; x += step) {
            if (img.data[(y * cW + x) * 4 + 3] > 128) {
                filled.push({ x: ofsX + x, y: ofsY + y });
            }
        }
    }

    // Shuffle so particles don't converge in raster-scan order
    for (let i = filled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filled[i], filled[j]] = [filled[j], filled[i]];
    }

    // Build result — cycle through filled positions + jitter
    const result: { x: number; y: number }[] = [];
    if (filled.length === 0) {
        // fallback: circle
        for (let i = 0; i < count; i++) {
            const a = (i / count) * Math.PI * 2;
            const r = maxSize * 0.35 * Math.sqrt(Math.random());
            result.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
        }
    } else {
        for (let i = 0; i < count; i++) {
            const pt = filled[i % filled.length];
            result.push({
                x: pt.x + (Math.random() - 0.5) * 3,
                y: pt.y + (Math.random() - 0.5) * 3,
            });
        }
    }
    return result;
}

function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace("#", "");
    return [
        parseInt(h.substring(0, 2), 16),
        parseInt(h.substring(2, 4), 16),
        parseInt(h.substring(4, 6), 16),
    ];
}

// ── Particle animation phases ──
type AnimPhase = "idle" | "forming" | "holding" | "dropping";

interface Particle {
    x: number; y: number; vx: number; vy: number;
    r: number; drawR: number;
    tx: number; ty: number; // target position for logo
}

export default function DomainShowcase({
    domain,
    defaultHeading,
    defaultSubheading,
}: DomainShowcaseProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const accentRef = useRef<string | undefined>(domain?.color);
    const particlesRef = useRef<Particle[]>([]);
    const sizeRef = useRef({ w: 0, h: 0 });
    // Mutable phase visible to the animation loop
    const phaseRef = useRef<AnimPhase>("idle");
    const phaseStartRef = useRef(0);

    // ── Text state machine ──
    const [textPhase, setTextPhase] = useState<"idle" | "fade-out" | "fade-in">("idle");
    const [displayHeading, setDisplayHeading] = useState(defaultHeading);
    const [displaySub, setDisplaySub] = useState(defaultSubheading);
    const [displayColor, setDisplayColor] = useState<string | undefined>();

    const targetHeading = domain ? domain.label : defaultHeading;
    const targetSub = domain?.description ?? defaultSubheading;
    const targetColor = domain?.color;

    const prevDomainRef = useRef<string | null>(null);
    const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

    // Clean up timers on unmount
    useEffect(() => () => { timersRef.current.forEach(clearTimeout); }, []);

    // ── Domain change → orchestrate the sequence ──
    useEffect(() => {
        const domainId = domain?.id ?? null;
        if (domainId === prevDomainRef.current) return;
        prevDomainRef.current = domainId;

        // Clear pending timers
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];

        // Immediately update accent color for particles
        accentRef.current = targetColor;

        // 1) Fade text out
        setTextPhase("fade-out");

        if (domainId && LOGO_DEFS[domainId]) {
            // 2) After text is gone (350ms), start forming logo
            const t1 = setTimeout(() => {
                // Generate target positions
                const { w, h } = sizeRef.current;
                const logoSize = Math.min(w, h) * 0.55;
                const targets = sampleLogoPoints(
                    LOGO_DEFS[domainId],
                    particlesRef.current.length,
                    w / 2,
                    h / 2,
                    logoSize,
                );
                const particles = particlesRef.current;
                for (let i = 0; i < particles.length; i++) {
                    particles[i].tx = targets[i].x;
                    particles[i].ty = targets[i].y;
                }
                phaseRef.current = "forming";
                phaseStartRef.current = performance.now();
            }, 350);

            // 3) After forming (~1200ms), hold briefly
            const t2 = setTimeout(() => {
                phaseRef.current = "holding";
                phaseStartRef.current = performance.now();
            }, 350 + 1200);

            // 4) After hold (~600ms), explode outward to clear center
            const t3 = setTimeout(() => {
                const { w, h } = sizeRef.current;
                const centerX = w / 2;
                const centerY = h / 2;
                const EXPLODE_FORCE = 18;
                for (const p of particlesRef.current) {
                    const dx = p.x - centerX;
                    const dy = p.y - centerY;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    // Mostly horizontal push, slight vertical scatter
                    p.vx = (dx / dist) * EXPLODE_FORCE * (0.8 + Math.random() * 0.4);
                    p.vy = (dy / dist) * EXPLODE_FORCE * (0.3 + Math.random() * 0.4);
                }
                phaseRef.current = "dropping";
                phaseStartRef.current = performance.now();
            }, 350 + 1200 + 600);

            // 5) After explosion settles (~600ms), show new text
            const t4 = setTimeout(() => {
                phaseRef.current = "idle";
                setDisplayHeading(targetHeading);
                setDisplaySub(targetSub);
                setDisplayColor(targetColor);
                setTextPhase("fade-in");
            }, 350 + 1200 + 600 + 600);

            const t5 = setTimeout(() => { setTextPhase("idle"); }, 350 + 1200 + 600 + 600 + 500);
            timersRef.current = [t1, t2, t3, t4, t5];
        } else {
            // Going back to default — simple transition (no logo)
            const t1 = setTimeout(() => {
                setDisplayHeading(targetHeading);
                setDisplaySub(targetSub);
                setDisplayColor(targetColor);
                setTextPhase("fade-in");
                phaseRef.current = "idle";
            }, 350);
            const t2 = setTimeout(() => { setTextPhase("idle"); }, 850);
            timersRef.current = [t1, t2];
        }
    }, [domain, targetHeading, targetSub, targetColor]);

    // ── Canvas / physics loop ──
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animId: number;
        const mouse = { x: -9999, y: -9999, inside: false };
        let pouring = false;
        const DRIP_RATE = 3;
        let grid: Map<number, number[]> = new Map();

        function hashKey(cx: number, cy: number) { return cx * 73856093 + cy * 19349663; }

        function buildGrid() {
            grid.clear();
            const particles = particlesRef.current;
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const cx = Math.floor(p.x / CELL_SIZE);
                const cy = Math.floor(p.y / CELL_SIZE);
                const key = hashKey(cx, cy);
                const cell = grid.get(key);
                if (cell) cell.push(i); else grid.set(key, [i]);
            }
        }

        function getNeighborIndices(px: number, py: number) {
            const result: number[] = [];
            const cx = Math.floor(px / CELL_SIZE);
            const cy = Math.floor(py / CELL_SIZE);
            for (let dxx = -1; dxx <= 1; dxx++) {
                for (let dyy = -1; dyy <= 1; dyy++) {
                    const cell = grid.get(hashKey(cx + dxx, cy + dyy));
                    if (cell) for (let k = 0; k < cell.length; k++) result.push(cell[k]);
                }
            }
            return result;
        }

        function initParticles() {
            const w = sizeRef.current.w;
            const h = sizeRef.current.h;
            const arr: Particle[] = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const drawR = DRAW_MIN + Math.random() * (DRAW_MAX - DRAW_MIN);
                arr.push({
                    x: MARGIN + RADIUS + Math.random() * (w - MARGIN * 2 - RADIUS * 2),
                    y: MARGIN + RADIUS + Math.random() * (h - MARGIN * 2 - RADIUS * 2),
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    r: RADIUS, drawR,
                    tx: 0, ty: 0,
                });
            }
            particlesRef.current = arr;
        }

        function resize() {
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            sizeRef.current = { w: rect.width, h: rect.height };
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
            initParticles();
        }

        function velocityColor(speed: number, alpha: number): string {
            const t = Math.min(speed / 8, 1);
            const accent = accentRef.current;
            if (accent) {
                const [ar, ag, ab] = hexToRgb(accent);
                const r = Math.round(ar * 0.25 + t * ar * 0.75);
                const g = Math.round(ag * 0.25 + t * ag * 0.75);
                const b = Math.round(ab * 0.25 + t * ab * 0.75);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }
            const r = Math.round(30 + t * 170);
            const g = Math.round(40 + t * 190);
            const b = Math.round(90 + t * 156);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        function solidColor(): string {
            const accent = accentRef.current;
            if (accent) return accent;
            return "#3B82F6";
        }

        function spawnDrip(px: number, py: number) {
            for (let i = 0; i < DRIP_RATE; i++) {
                const drawR = DRAW_MIN + Math.random() * (DRAW_MAX - DRAW_MIN);
                particlesRef.current.push({
                    x: px + (Math.random() - 0.5) * 12,
                    y: py + (Math.random() - 0.5) * 6,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: 0.5 + Math.random() * 1.2,
                    r: RADIUS, drawR, tx: 0, ty: 0,
                });
            }
        }

        function resolveCollisions() {
            buildGrid();
            const particles = particlesRef.current;
            for (let i = 0; i < particles.length; i++) {
                const a = particles[i];
                const neighbors = getNeighborIndices(a.x, a.y);
                for (let n = 0; n < neighbors.length; n++) {
                    const j = neighbors[n];
                    if (j <= i) continue;
                    const b = particles[j];
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const distSq = dx * dx + dy * dy;
                    const minDist = a.r + b.r;
                    if (distSq < minDist * minDist && distSq > 0.001) {
                        const dist = Math.sqrt(distSq);
                        const overlap = minDist - dist;
                        const nx = dx / dist;
                        const ny = dy / dist;
                        const push = overlap * 0.5;
                        a.x -= nx * push; a.y -= ny * push;
                        b.x += nx * push; b.y += ny * push;
                        const relVx = a.vx - b.vx;
                        const relVy = a.vy - b.vy;
                        const relDot = relVx * nx + relVy * ny;
                        if (relDot > 0) {
                            const impulse = relDot * PARTICLE_BOUNCE;
                            a.vx -= impulse * nx; a.vy -= impulse * ny;
                            b.vx += impulse * nx; b.vy += impulse * ny;
                        }
                    }
                }
            }
        }

        function animate() {
            const { w, h } = sizeRef.current;
            ctx!.clearRect(0, 0, w, h);
            const particles = particlesRef.current;
            const phase = phaseRef.current;

            if (pouring && mouse.inside && phase === "idle") spawnDrip(mouse.x, mouse.y);

            const minX = MARGIN, maxX = w - MARGIN;
            const minY = MARGIN, maxY = h - MARGIN;

            // ── Physics per phase ──
            if (phase === "forming") {
                // Attract particles to their logo target — spring force, strong damping
                const ATTRACT = 0.08;
                const DAMP = 0.85;
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    const dx = p.tx - p.x;
                    const dy = p.ty - p.y;
                    p.vx += dx * ATTRACT;
                    p.vy += dy * ATTRACT;
                    p.vx *= DAMP;
                    p.vy *= DAMP;
                    p.x += p.vx;
                    p.y += p.vy;
                }
            } else if (phase === "holding") {
                // Very strong pull — lock particles in place
                const ATTRACT = 0.2;
                const DAMP = 0.7;
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    const dx = p.tx - p.x;
                    const dy = p.ty - p.y;
                    p.vx += dx * ATTRACT;
                    p.vy += dy * ATTRACT;
                    p.vx *= DAMP;
                    p.vy *= DAMP;
                    p.x += p.vx;
                    p.y += p.vy;
                }
            } else if (phase === "dropping") {
                // Explosion outward + gravity pulling down, strong friction to settle fast
                const DROP_FRICTION = 0.96;
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    p.vy += GRAVITY * 1.5;   // heavier gravity so they settle to bottom
                    p.vx *= DROP_FRICTION;
                    p.vy *= DROP_FRICTION;
                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.x - p.r < minX) { p.x = minX + p.r; p.vx = Math.abs(p.vx) * WALL_BOUNCE; }
                    else if (p.x + p.r > maxX) { p.x = maxX - p.r; p.vx = -Math.abs(p.vx) * WALL_BOUNCE; }
                    if (p.y - p.r < minY) { p.y = minY + p.r; p.vy = Math.abs(p.vy) * WALL_BOUNCE; }
                    else if (p.y + p.r > maxY) { p.y = maxY - p.r; p.vy = -Math.abs(p.vy) * WALL_BOUNCE; }
                }
            } else {
                // idle — normal physics
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    p.vy += GRAVITY;
                    if (mouse.inside && !pouring) {
                        const dx = p.x - mouse.x;
                        const dy = p.y - mouse.y;
                        const distSq = dx * dx + dy * dy;
                        if (distSq < MOUSE_RADIUS * MOUSE_RADIUS && distSq > 0.01) {
                            const dist = Math.sqrt(distSq);
                            const force = ((MOUSE_RADIUS - dist) / MOUSE_RADIUS) * MOUSE_FORCE;
                            p.vx += (dx / dist) * force;
                            p.vy += (dy / dist) * force;
                        }
                    }
                    p.vx *= FRICTION;
                    p.vy *= FRICTION;
                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.x - p.r < minX) { p.x = minX + p.r; p.vx = Math.abs(p.vx) * WALL_BOUNCE; }
                    else if (p.x + p.r > maxX) { p.x = maxX - p.r; p.vx = -Math.abs(p.vx) * WALL_BOUNCE; }
                    if (p.y - p.r < minY) { p.y = minY + p.r; p.vy = Math.abs(p.vy) * WALL_BOUNCE; }
                    else if (p.y + p.r > maxY) { p.y = maxY - p.r; p.vy = -Math.abs(p.vy) * WALL_BOUNCE; }
                }
                for (let iter = 0; iter < COLLISION_ITERS; iter++) resolveCollisions();
                for (let i = 0; i < particles.length; i++) {
                    const p = particles[i];
                    if (p.x - p.r < minX) p.x = minX + p.r;
                    else if (p.x + p.r > maxX) p.x = maxX - p.r;
                    if (p.y - p.r < minY) p.y = minY + p.r;
                    else if (p.y + p.r > maxY) p.y = maxY - p.r;
                }
            }

            // ── Draw ──
            const useSolid = phase === "holding" || phase === "forming";
            const sc = solidColor();
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                const alpha = useSolid ? 0.9 : 0.4 + Math.min(speed / 5, 0.5);
                ctx!.beginPath();
                ctx!.arc(p.x, p.y, p.drawR, 0, Math.PI * 2);
                ctx!.fillStyle = useSolid ? sc : velocityColor(speed, alpha);
                ctx!.fill();
            }

            animId = requestAnimationFrame(animate);
        }

        // ── Listeners ──
        function onMouseMove(e: MouseEvent) {
            const rect = canvas!.getBoundingClientRect();
            mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top; mouse.inside = true;
        }
        function onMouseLeave() { mouse.inside = false; mouse.x = -9999; mouse.y = -9999; }
        function onMouseDown(e: MouseEvent) {
            pouring = true;
            const rect = canvas!.getBoundingClientRect();
            mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top; mouse.inside = true;
        }
        function onMouseUp() { pouring = false; }
        function onTouchMove(e: TouchEvent) {
            if (e.touches.length === 0) return;
            const rect = canvas!.getBoundingClientRect();
            mouse.x = e.touches[0].clientX - rect.left;
            mouse.y = e.touches[0].clientY - rect.top;
            mouse.inside = true;
        }
        function onTouchEnd() { mouse.inside = false; mouse.x = -9999; mouse.y = -9999; }
        function onTouchStart(e: TouchEvent) {
            if (e.touches.length === 0) return;
            pouring = true;
            const rect = canvas!.getBoundingClientRect();
            mouse.x = e.touches[0].clientX - rect.left;
            mouse.y = e.touches[0].clientY - rect.top;
            mouse.inside = true;
        }
        function onTouchEndPour() { pouring = false; }

        resize();
        animate();

        window.addEventListener("resize", resize);
        canvas.addEventListener("mousemove", onMouseMove);
        canvas.addEventListener("mouseleave", onMouseLeave);
        canvas.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mouseup", onMouseUp);
        canvas.addEventListener("touchstart", onTouchStart, { passive: true });
        canvas.addEventListener("touchmove", onTouchMove, { passive: true });
        canvas.addEventListener("touchend", onTouchEnd);
        canvas.addEventListener("touchend", onTouchEndPour);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
            canvas.removeEventListener("mousemove", onMouseMove);
            canvas.removeEventListener("mouseleave", onMouseLeave);
            canvas.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("mouseup", onMouseUp);
            canvas.removeEventListener("touchstart", onTouchStart);
            canvas.removeEventListener("touchmove", onTouchMove);
            canvas.removeEventListener("touchend", onTouchEnd);
            canvas.removeEventListener("touchend", onTouchEndPour);
        };
    }, []);

    // Phase → CSS class
    const textClass =
        textPhase === "fade-out"
            ? "domain-text domain-text--out"
            : textPhase === "fade-in"
                ? "domain-text domain-text--in"
                : "domain-text domain-text--idle";

    return (
        <section
            id="about"
            className="wrapper wrapper--ticks border-t border-nickel relative overflow-hidden"
            style={{ minHeight: "clamp(320px, 40vh, 500px)" }}
        >
            {/* Particle canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: "auto" }}
            />

            {/* Text overlay */}
            <div className="relative z-10 flex flex-col justify-center items-center text-center pointer-events-none px-5 sm:px-10 py-14 sm:py-28">
                <div className={textClass}>
                    <h2
                        className="text-heading-2 text-white max-w-2xl text-balance text-center"
                        style={displayColor ? { color: displayColor } : undefined}
                    >
                        {displayHeading}
                    </h2>
                    <p className="max-w-lg text-white/70 text-balance sm:text-pretty text-base md:text-lg mt-3">
                        {displaySub}
                    </p>
                </div>
            </div>
        </section>
    );
}
