import { useEffect, useRef } from "react";

interface ParticleFieldProps {
    accentColor?: string;
}

/**
 * Fluid / liquid particle simulation with rigid-body collisions.
 * - Gravity pulls particles down so they pool at the bottom.
 * - Particles collide with each other (spatial-hash broadphase).
 * - They stack, pile up, and push each other like a real liquid.
 * - Mouse pushes particles away like stirring.
 * - Color shifts based on velocity.
 */
export default function ParticleField({ accentColor }: ParticleFieldProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const accentRef = useRef(accentColor);
    accentRef.current = accentColor;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animId: number;
        let mouse = { x: -9999, y: -9999, inside: false };
        let width = 0;
        let height = 0;

        // ------- Physics config -------
        const PARTICLE_COUNT = 900;
        const GRAVITY = 0.08;
        const FRICTION = 0.98;
        const WALL_BOUNCE = 0.3;
        const PARTICLE_BOUNCE = 0.4;
        const MOUSE_RADIUS = 100;
        const MOUSE_FORCE = 12;
        const RADIUS = 4;          // uniform collision radius
        const DRAW_MIN = 2.0;
        const DRAW_MAX = 3.8;
        const COLLISION_ITERS = 2;  // resolve overlaps multiple times per frame
        const MARGIN = 1;

        interface Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            r: number;       // collision radius
            drawR: number;   // visual radius
        }

        let particles: Particle[] = [];

        // --- Spatial hash for broadphase collision ---
        const CELL_SIZE = RADIUS * 4;
        let grid: Map<number, number[]> = new Map();

        function hashKey(cx: number, cy: number): number {
            // Simple spatial hash
            return cx * 73856093 + cy * 19349663;
        }

        function buildGrid() {
            grid.clear();
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const cx = Math.floor(p.x / CELL_SIZE);
                const cy = Math.floor(p.y / CELL_SIZE);
                const key = hashKey(cx, cy);
                const cell = grid.get(key);
                if (cell) {
                    cell.push(i);
                } else {
                    grid.set(key, [i]);
                }
            }
        }

        function getNeighborIndices(px: number, py: number): number[] {
            const result: number[] = [];
            const cx = Math.floor(px / CELL_SIZE);
            const cy = Math.floor(py / CELL_SIZE);

            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const cell = grid.get(hashKey(cx + dx, cy + dy));
                    if (cell) {
                        for (let k = 0; k < cell.length; k++) {
                            result.push(cell[k]);
                        }
                    }
                }
            }
            return result;
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const drawR = DRAW_MIN + Math.random() * (DRAW_MAX - DRAW_MIN);
                particles.push({
                    x: MARGIN + RADIUS + Math.random() * (width - MARGIN * 2 - RADIUS * 2),
                    y: MARGIN + RADIUS + Math.random() * (height - MARGIN * 2 - RADIUS * 2),
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    r: RADIUS,
                    drawR,
                });
            }
        }

        function resize() {
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = rect.width;
            height = rect.height;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
            initParticles();
        }

        function onMouseMove(e: MouseEvent) {
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            mouse.inside = true;
        }

        function onMouseLeave() {
            mouse.inside = false;
            mouse.x = -9999;
            mouse.y = -9999;
        }

        function onTouchMove(e: TouchEvent) {
            if (!canvas || e.touches.length === 0) return;
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.touches[0].clientX - rect.left;
            mouse.y = e.touches[0].clientY - rect.top;
            mouse.inside = true;
        }

        function onTouchEnd() {
            mouse.inside = false;
            mouse.x = -9999;
            mouse.y = -9999;
        }

        // --- Continuous drip/pour while mouse held ---
        let pouring = false;
        const DRIP_RATE = 3; // particles per frame while held

        function spawnDrip(px: number, py: number) {
            for (let i = 0; i < DRIP_RATE; i++) {
                const drawR = DRAW_MIN + Math.random() * (DRAW_MAX - DRAW_MIN);
                particles.push({
                    x: px + (Math.random() - 0.5) * 12,
                    y: py + (Math.random() - 0.5) * 6,
                    vx: (Math.random() - 0.5) * 0.8,
                    vy: 0.5 + Math.random() * 1.2,  // gentle downward flow
                    r: RADIUS,
                    drawR,
                });
            }
        }

        function onMouseDown(e: MouseEvent) {
            if (!canvas) return;
            pouring = true;
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            mouse.inside = true;
        }

        function onMouseUp() {
            pouring = false;
        }

        function onTouchStart(e: TouchEvent) {
            if (!canvas || e.touches.length === 0) return;
            pouring = true;
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.touches[0].clientX - rect.left;
            mouse.y = e.touches[0].clientY - rect.top;
            mouse.inside = true;
        }

        function onTouchEndPour() {
            pouring = false;
        }

        // Parse hex color to RGB
        function hexToRgb(hex: string): [number, number, number] {
            const h = hex.replace("#", "");
            return [
                parseInt(h.substring(0, 2), 16),
                parseInt(h.substring(2, 4), 16),
                parseInt(h.substring(4, 6), 16),
            ];
        }

        // Velocity → color mapping (accent-aware)
        function velocityColor(speed: number, alpha: number): string {
            const t = Math.min(speed / 8, 1);
            const accent = accentRef.current;
            if (accent) {
                const [ar, ag, ab] = hexToRgb(accent);
                // Resting: dim accent → fast: bright accent
                const r = Math.round(ar * 0.25 + t * ar * 0.75);
                const g = Math.round(ag * 0.25 + t * ag * 0.75);
                const b = Math.round(ab * 0.25 + t * ab * 0.75);
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }
            // Default: muted blue-grey → bright electric blue/cyan
            const r = Math.round(30 + t * 170);
            const g = Math.round(40 + t * 190);
            const b = Math.round(90 + t * 156);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        function resolveCollisions() {
            buildGrid();

            for (let i = 0; i < particles.length; i++) {
                const a = particles[i];
                const neighbors = getNeighborIndices(a.x, a.y);

                for (let n = 0; n < neighbors.length; n++) {
                    const j = neighbors[n];
                    if (j <= i) continue; // avoid double-check

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

                        // Push apart (equal mass)
                        const push = overlap * 0.5;
                        a.x -= nx * push;
                        a.y -= ny * push;
                        b.x += nx * push;
                        b.y += ny * push;

                        // Velocity exchange along collision normal
                        const relVx = a.vx - b.vx;
                        const relVy = a.vy - b.vy;
                        const relDot = relVx * nx + relVy * ny;

                        if (relDot > 0) {
                            const impulse = relDot * PARTICLE_BOUNCE;
                            a.vx -= impulse * nx;
                            a.vy -= impulse * ny;
                            b.vx += impulse * nx;
                            b.vy += impulse * ny;
                        }
                    }
                }
            }
        }

        function animate() {
            ctx!.clearRect(0, 0, width, height);

            // --- Drip particles while pouring ---
            if (pouring && mouse.inside) {
                spawnDrip(mouse.x, mouse.y);
            }

            const minX = MARGIN;
            const maxX = width - MARGIN;
            const minY = MARGIN;
            const maxY = height - MARGIN;

            // --- Physics step ---
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Gravity
                p.vy += GRAVITY;

                // Mouse interaction — only push when NOT pouring
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

                // Friction
                p.vx *= FRICTION;
                p.vy *= FRICTION;

                // Integrate
                p.x += p.vx;
                p.y += p.vy;

                // Wall containment
                if (p.x - p.r < minX) {
                    p.x = minX + p.r;
                    p.vx = Math.abs(p.vx) * WALL_BOUNCE;
                } else if (p.x + p.r > maxX) {
                    p.x = maxX - p.r;
                    p.vx = -Math.abs(p.vx) * WALL_BOUNCE;
                }
                if (p.y - p.r < minY) {
                    p.y = minY + p.r;
                    p.vy = Math.abs(p.vy) * WALL_BOUNCE;
                } else if (p.y + p.r > maxY) {
                    p.y = maxY - p.r;
                    p.vy = -Math.abs(p.vy) * WALL_BOUNCE;
                }
            }

            // --- Particle-to-particle collision (multiple iterations for stability) ---
            for (let iter = 0; iter < COLLISION_ITERS; iter++) {
                resolveCollisions();
            }

            // --- Re-clamp after collision pushes ---
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (p.x - p.r < minX) p.x = minX + p.r;
                else if (p.x + p.r > maxX) p.x = maxX - p.r;
                if (p.y - p.r < minY) p.y = minY + p.r;
                else if (p.y + p.r > maxY) p.y = maxY - p.r;
            }

            // --- Draw ---
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                const alpha = 0.4 + Math.min(speed / 5, 0.5);

                ctx!.beginPath();
                ctx!.arc(p.x, p.y, p.drawR, 0, Math.PI * 2);
                ctx!.fillStyle = velocityColor(speed, alpha);
                ctx!.fill();
            }

            animId = requestAnimationFrame(animate);
        }

        // Init
        resize();
        animate();

        // Listeners
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

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ pointerEvents: "auto" }}
        />
    );
}
