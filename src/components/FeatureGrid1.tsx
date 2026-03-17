import { useEffect, useRef, useState } from "react";

/* ─── SkyGuard cinematic drone close-up ─── */
function SkyGuardCinematic() {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        let raf: number;

        function resize() {
            const rect = canvas!.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas!.width = rect.width * dpr;
            canvas!.height = rect.height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        const g = (a: number) => `rgba(34,255,115,${a})`;

        /* ---- floating dust motes ---- */
        const particles = Array.from({ length: 24 }, () => ({
            x: Math.random(),
            y: Math.random(),
            s: 0.4 + Math.random() * 1.2,
            dx: (Math.random() - 0.5) * 0.003,
            dy: (Math.random() - 0.5) * 0.002 - 0.001,
            a: 0.06 + Math.random() * 0.12,
        }));

        function draw() {
            const w = canvas!.getBoundingClientRect().width;
            const h = canvas!.getBoundingClientRect().height;
            const t = performance.now() / 1000;
            ctx.clearRect(0, 0, w, h);



            /* ---- cinematic camera drift ---- */
            const camX = Math.sin(t * 0.15) * w * 0.02;
            const camY = Math.cos(t * 0.12) * h * 0.015;

            /* ---- ambient light sweep (slow diagonal) ---- */
            const sweepAngle = t * 0.08;
            const sx = w * 0.5 + Math.cos(sweepAngle) * w * 0.7;
            const sy = h * 0.5 + Math.sin(sweepAngle) * h * 0.5;
            const ambient = ctx.createRadialGradient(sx, sy, 0, sx, sy, w * 0.55);
            ambient.addColorStop(0, g(0.04));
            ambient.addColorStop(0.5, g(0.015));
            ambient.addColorStop(1, "transparent");
            ctx.fillStyle = ambient;
            ctx.fillRect(0, 0, w, h);

            /* ── DRONE ── */
            const cx = w * 0.5 + camX;
            // Gentle breathing float
            const breathe = Math.sin(t * 0.8) * 4 + Math.sin(t * 1.3) * 2;
            const cy = h * 0.44 + camY + breathe;
            // Subtle tilt from camera drift
            const tilt = Math.sin(t * 0.18) * 0.03;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(tilt);

            const S = Math.min(w, h) * 0.55;  // drone scale

            /* Body — central fuselage */
            ctx.fillStyle = g(0.8);
            ctx.beginPath();
            ctx.roundRect(-S * 0.14, -S * 0.04, S * 0.28, S * 0.08, 3);
            ctx.fill();
            // Body highlight
            const bodyGrad = ctx.createLinearGradient(0, -S * 0.04, 0, S * 0.04);
            bodyGrad.addColorStop(0, g(0.15));
            bodyGrad.addColorStop(1, g(0));
            ctx.fillStyle = bodyGrad;
            ctx.fillRect(-S * 0.12, -S * 0.04, S * 0.24, S * 0.04);

            /* Camera gimbal (underside) */
            ctx.fillStyle = g(0.5);
            ctx.beginPath();
            ctx.roundRect(-S * 0.04, S * 0.04, S * 0.08, S * 0.055, 2);
            ctx.fill();
            // Lens
            const lensGlow = 0.4 + Math.sin(t * 2) * 0.15;
            ctx.beginPath(); ctx.arc(0, S * 0.065, S * 0.022, 0, Math.PI * 2);
            ctx.fillStyle = g(lensGlow); ctx.fill();
            // Lens glint
            ctx.beginPath(); ctx.arc(S * 0.006, S * 0.058, S * 0.006, 0, Math.PI * 2);
            ctx.fillStyle = g(0.9); ctx.fill();

            /* Arms + motors + propellers */
            const arms: [number, number][] = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
            const propTick = t * 28;  // fast spin

            arms.forEach(([ax, ay], i) => {
                const mx = ax * S * 0.36;
                const my = ay * S * 0.22;

                // Arm
                ctx.strokeStyle = g(0.45); ctx.lineWidth = Math.max(1.5, S * 0.018);
                ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(mx, my); ctx.stroke();

                // Motor housing
                ctx.fillStyle = g(0.55);
                ctx.beginPath(); ctx.arc(mx, my, S * 0.04, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = g(0.2); ctx.lineWidth = 0.8;
                ctx.beginPath(); ctx.arc(mx, my, S * 0.04, 0, Math.PI * 2); ctx.stroke();

                // Propeller disc (motion blur effect)
                const discA = 0.06 + Math.sin(t * 3 + i) * 0.02;
                ctx.beginPath(); ctx.arc(mx, my, S * 0.12, 0, Math.PI * 2);
                ctx.fillStyle = g(discA); ctx.fill();

                // Propeller blades (fast spinning)
                const bAngle = propTick + i * 1.57;
                for (let b = 0; b < 2; b++) {
                    const ba = bAngle + b * Math.PI;
                    ctx.beginPath();
                    ctx.moveTo(mx + Math.cos(ba) * S * 0.11, my + Math.sin(ba) * S * 0.11);
                    ctx.lineTo(mx - Math.cos(ba) * S * 0.11, my - Math.sin(ba) * S * 0.11);
                    ctx.strokeStyle = g(0.35); ctx.lineWidth = Math.max(1.2, S * 0.02);
                    ctx.stroke();
                }

                // Downwash glow under each motor
                const wash = ctx.createRadialGradient(mx, my + S * 0.06, 0, mx, my + S * 0.15, S * 0.14);
                wash.addColorStop(0, g(0.04));
                wash.addColorStop(1, "transparent");
                ctx.fillStyle = wash;
                ctx.beginPath(); ctx.arc(mx, my + S * 0.1, S * 0.14, 0, Math.PI * 2); ctx.fill();
            });

            /* Status LEDs */
            // Front LED (green, steady)
            ctx.beginPath(); ctx.arc(0, -S * 0.045, 1.8, 0, Math.PI * 2);
            ctx.fillStyle = g(0.6 + Math.sin(t * 4) * 0.2); ctx.fill();
            // LED glow
            ctx.beginPath(); ctx.arc(0, -S * 0.045, 4, 0, Math.PI * 2);
            ctx.fillStyle = g(0.08); ctx.fill();

            // Rear LEDs (red, blinking)
            const redBlink = Math.sin(t * 3) > 0 ? 0.6 : 0.1;
            ctx.beginPath(); ctx.arc(-S * 0.06, S * 0.04, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,60,60,${redBlink})`; ctx.fill();
            ctx.beginPath(); ctx.arc(S * 0.06, S * 0.04, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,60,60,${redBlink})`; ctx.fill();

            ctx.restore();

            /* ---- scanning cone from camera ---- */
            const scanCycle = t % 6;  // 6-second cycle
            if (scanCycle > 1.5) {
                const scanProgress = Math.min((scanCycle - 1.5) / 1.0, 1);
                const scanAlpha = scanCycle < 4.5 ? scanProgress * 0.12 : Math.max(0, (5.5 - scanCycle) * 0.12);
                const sweepOff = Math.sin(t * 0.4) * S * 0.25;
                const coneW = S * 0.45;
                const coneH = h - cy + S * 0.07;

                ctx.save();
                ctx.globalAlpha = scanAlpha;
                // Main cone
                ctx.beginPath();
                ctx.moveTo(cx, cy + S * 0.07);
                ctx.lineTo(cx - coneW + sweepOff, cy + coneH);
                ctx.lineTo(cx + coneW + sweepOff, cy + coneH);
                ctx.closePath();
                const coneGrad = ctx.createLinearGradient(cx, cy + S * 0.07, cx, cy + coneH);
                coneGrad.addColorStop(0, g(0.7));
                coneGrad.addColorStop(0.3, g(0.25));
                coneGrad.addColorStop(1, g(0.02));
                ctx.fillStyle = coneGrad;
                ctx.fill();

                // Scan line sweeping down the cone
                const lineY = cy + S * 0.07 + ((t * 0.5) % 1) * coneH;
                const lineW = coneW * ((lineY - cy) / coneH) + sweepOff * ((lineY - cy) / coneH);
                ctx.beginPath();
                ctx.moveTo(cx - lineW, lineY);
                ctx.lineTo(cx + lineW, lineY);
                ctx.strokeStyle = g(0.5);
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();
            }

            /* ---- depth-of-field glow behind drone ---- */
            const dofR = S * 0.55;
            const dof = ctx.createRadialGradient(cx, cy, S * 0.1, cx, cy, dofR);
            dof.addColorStop(0, g(0.045));
            dof.addColorStop(0.6, g(0.015));
            dof.addColorStop(1, "transparent");
            ctx.fillStyle = dof;
            ctx.beginPath(); ctx.arc(cx, cy, dofR, 0, Math.PI * 2); ctx.fill();

            /* ---- floating dust/bokeh particles ---- */
            particles.forEach(p => {
                p.x += p.dx;
                p.y += p.dy;
                if (p.x < -0.05 || p.x > 1.05) p.dx *= -1;
                if (p.y < -0.05 || p.y > 1.05) { p.y = 1.05; p.dy = -(Math.random() * 0.002 + 0.001); }

                const px = p.x * w + camX * 0.5;
                const py = p.y * h + camY * 0.5;
                const pulse = p.a + Math.sin(t * 1.5 + p.x * 10) * 0.03;

                ctx.beginPath(); ctx.arc(px, py, p.s, 0, Math.PI * 2);
                ctx.fillStyle = g(pulse); ctx.fill();
                // Soft bokeh halo on larger particles
                if (p.s > 0.9) {
                    ctx.beginPath(); ctx.arc(px, py, p.s * 3, 0, Math.PI * 2);
                    ctx.fillStyle = g(pulse * 0.15); ctx.fill();
                }
            });

            /* ---- soft edge fade (matches site bg #16171d) ---- */
            const vig = ctx.createRadialGradient(w / 2, h / 2, w * 0.25, w / 2, h / 2, w * 0.72);
            vig.addColorStop(0, "transparent");
            vig.addColorStop(0.7, "transparent");
            vig.addColorStop(1, "rgba(22,23,29,0.45)");
            ctx.fillStyle = vig;
            ctx.fillRect(0, 0, w, h);

            raf = requestAnimationFrame(draw);
        }

        resize();
        draw();
        window.addEventListener("resize", resize);
        return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    }, []);

    return <canvas ref={ref} className="w-full h-full" />;
}

/* ─── Waveform visualizer for Digital Receptionist ─── */
function VoiceWaveform() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        let animId: number;

        function resize() {
            const rect = canvas!.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas!.width = rect.width * dpr;
            canvas!.height = rect.height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function draw() {
            const w = canvas!.getBoundingClientRect().width;
            const h = canvas!.getBoundingClientRect().height;
            const now = performance.now() / 1000;
            ctx.clearRect(0, 0, w, h);

            const cx = w / 2;
            const cy = h / 2;
            const bars = 40;
            const barWidth = Math.max(2, w / bars * 0.4);
            const gap = w / bars;
            const maxH = h * 0.6;

            for (let i = 0; i < bars; i++) {
                const x = (i + 0.5) * gap;
                const distFromCenter = Math.abs(x - cx) / (w / 2);
                const envelope = 1 - distFromCenter * distFromCenter;

                const wave1 = Math.sin(now * 2.5 + i * 0.3) * 0.4;
                const wave2 = Math.sin(now * 1.8 + i * 0.5 + 1) * 0.3;
                const wave3 = Math.sin(now * 4.2 + i * 0.15) * 0.2;
                const amplitude = (0.15 + (wave1 + wave2 + wave3 + 1) * 0.5) * envelope;

                const barH = Math.max(2, amplitude * maxH);
                const alpha = 0.3 + envelope * 0.5;

                const gradient = ctx.createLinearGradient(x, cy - barH / 2, x, cy + barH / 2);
                gradient.addColorStop(0, `rgba(59, 130, 246, ${alpha * 0.3})`);
                gradient.addColorStop(0.5, `rgba(59, 130, 246, ${alpha})`);
                gradient.addColorStop(1, `rgba(59, 130, 246, ${alpha * 0.3})`);

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.roundRect(x - barWidth / 2, cy - barH / 2, barWidth, barH, barWidth / 2);
                ctx.fill();
            }



            animId = requestAnimationFrame(draw);
        }

        resize();
        draw();
        window.addEventListener("resize", resize);
        return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
    }, []);

    return <canvas ref={canvasRef} className="w-full h-full" />;
}

/* ─── Auto-scrolling press / media mentions ─── */
const pressItems = [
    { source: "SUM News", description: "AI-powered reception system transforms campus experience", color: "#eab308" },
    { source: "WURI Report", description: "SUMAI project recognized among world's top innovations", color: "#22c55e" },
    { source: "StartUp.ba", description: "Young innovator bridges agriculture and artificial intelligence", color: "#22d3ee" },
    { source: "Tech Scene", description: "From Mostar to global stage: drone tech for smart farming", color: "#22FF73" },
    { source: "Agroklub", description: "Precision agriculture meets AI: SkyGuard drone monitoring system", color: "#f97316" },
    { source: "SUM Sova", description: "Student-led AI project wins international recognition at WURI", color: "#3b82f6" },
    { source: "Klix.ba", description: "Bosnian startup builds autonomous drones for environmental monitoring", color: "#a78bfa" },
    { source: "ICT Business", description: "How emerging tech from BiH is reshaping agricultural innovation", color: "#f43f5e" },
];

function PressScroller() {
    const trackRef = useRef<HTMLDivElement>(null);
    const [halfHeight, setHalfHeight] = useState(0);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        // Measure half the duplicated list (= one full set of items)
        setHalfHeight(track.scrollHeight / 2);

        const ro = new ResizeObserver(() => {
            setHalfHeight(track.scrollHeight / 2);
        });
        ro.observe(track);
        return () => ro.disconnect();
    }, []);

    const duration = halfHeight * 0.06; // ~60ms per pixel → slow, readable scroll

    return (
        <div className="px-5 sm:px-10 pb-5 sm:pb-10 pt-2 sm:pt-2 relative">
            {/* Top fade mask */}
            <div className="pointer-events-none absolute top-2 left-5 sm:left-10 right-5 sm:right-10 h-8 z-10"
                style={{ background: "linear-gradient(to bottom, #16171d, transparent)" }} />
            {/* Bottom fade mask */}
            <div className="pointer-events-none absolute bottom-5 sm:bottom-10 left-5 sm:left-10 right-5 sm:right-10 h-8 z-10"
                style={{ background: "linear-gradient(to top, #16171d, transparent)" }} />

            <div className="overflow-hidden max-h-[240px]"
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
            >
                <div
                    ref={trackRef}
                    style={{
                        animation: halfHeight
                            ? `pressScroll ${duration}s linear infinite`
                            : undefined,
                        animationPlayState: paused ? "paused" : "running",
                    }}
                >
                    {/* Render items twice for seamless loop */}
                    {[...pressItems, ...pressItems].map((item, i) => (
                        <div key={i} className="flex items-start gap-5 py-3.5 border-b border-nickel/20">
                            <span
                                className="text-sm font-mono shrink-0 w-[120px]"
                                style={{ color: item.color }}
                            >
                                {item.source}
                            </span>
                            <span className="text-sm text-grey/70 leading-snug">
                                {item.description}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function FeatureGrid1() {
    return (
        <section
            id="projects"
            className="wrapper wrapper--ticks border-t border-nickel grid lg:grid-cols-2"
            style={{ display: "grid" }}
        >
            {/* SkyGuard — Autonomous Drones */}
            <div className="flex flex-col justify-between border-b border-nickel lg:border-b-0 lg:border-r">
                <div className="p-5 sm:p-10 flex flex-col gap-3">
                    <h5 className="text-heading-5 text-white">SkyGuard</h5>
                    <p className="sm:max-w-[28rem] text-pretty text-grey text-base md:text-lg">
                        Designing autonomous monitoring systems using drones and real-time
                        sensor data for precision agriculture and environmental surveillance.
                    </p>
                    <a
                        href="https://projectskyguard.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-zest/80 hover:text-zest transition-colors mt-1 w-fit font-mono"
                    >
                        projectskyguard.com
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-60">
                            <path d="M5.5 3.5H12.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12.5 3.5L3.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                </div>
                <div className="relative h-56 sm:h-64">
                    <SkyGuardCinematic />
                </div>
            </div>

            {/* Digital Receptionist — WURI 4th Place */}
            <div className="flex flex-col justify-between border-b border-nickel lg:border-b-0">
                <div className="p-5 sm:p-10 flex flex-col gap-3">
                    <h5 className="text-heading-5 text-white">Digital Receptionist</h5>
                    <p className="sm:max-w-[28rem] text-pretty text-grey text-base md:text-lg">
                        AI-powered smart reception system that earned 4th place in the
                        WURI World University Rankings for innovative real-world impact.
                    </p>
                    <a
                        href="https://www.sum.ba/objave/novosti/pametna-recepcija:-projekt-sumai-zauzeo-4-mjesto-na-svijetu-na-wuri"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-ruby/80 hover:text-ruby transition-colors mt-1 w-fit font-mono"
                    >
                        Read the article
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-60">
                            <path d="M5.5 3.5H12.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12.5 3.5L3.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                </div>
                <div className="relative h-56 sm:h-64">
                    <VoiceWaveform />
                </div>
            </div>

            {/* Cert Validator */}
            <div className="flex flex-col justify-between border-b border-nickel lg:border-b-0 lg:border-r pb-10">
                <div className="p-5 sm:p-10 flex flex-col gap-3">
                    <h5 className="text-heading-5 text-white">Cert Validator</h5>
                    <p className="sm:max-w-[28rem] text-pretty text-grey text-base md:text-lg">
                        Online certificate validation platform. Verify authenticity of
                        digital certificates instantly with a secure, tamper-proof system.
                    </p>
                    <a
                        href="https://cert.blazperic.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-cyan-400/80 hover:text-cyan-400 transition-colors mt-1 w-fit font-mono"
                    >
                        cert.blazperic.com
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-60">
                            <path d="M5.5 3.5H12.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M12.5 3.5L3.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </a>
                </div>
                <div className="relative p-6 sm:p-10 flex justify-center" style={{ background: "radial-gradient(ellipse at center, rgba(34, 211, 238, 0.04) 0%, transparent 70%)" }}>
                    <div className="w-full max-w-xs">
                        <div className="relative flex flex-col items-center gap-5">
                            <div className="relative">
                                <svg width="64" height="76" viewBox="0 0 64 76" fill="none" className="cert-shield-pulse">
                                    <path d="M32 2L4 16V38C4 54.57 16.29 69.86 32 74C47.71 69.86 60 54.57 60 38V16L32 2Z"
                                        stroke="rgba(34, 211, 238, 0.4)" strokeWidth="1.5" fill="rgba(34, 211, 238, 0.05)" />
                                    <path d="M22 38L29 45L42 32" stroke="rgba(34, 211, 238, 0.7)" strokeWidth="2.5"
                                        strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="absolute -inset-4 rounded-full bg-cyan-400/5 blur-xl animate-pulse" />
                            </div>
                            <div className="w-full space-y-3.5">
                                {[
                                    "Certificate parsed",
                                    "Signature verified",
                                    "Issuer validated",
                                ].map((label, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
                                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                <path d="M1.5 4L3.2 5.7L6.5 2.3" stroke="rgba(34, 211, 238, 0.8)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-mono text-cyan-400/60">{label}</span>
                                        <span className="ml-auto text-[10px] font-mono text-cyan-400/30">OK</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Press & Recognition */}
            <div className="flex flex-col justify-between">
                <div className="p-5 sm:p-10 flex flex-col gap-3">
                    <h5 className="text-heading-5 text-white">In the Media</h5>
                    <p className="sm:max-w-[28rem] text-pretty text-grey text-base md:text-lg">
                        Featured across regional and international outlets for innovation
                        in AgTech, AI, and emerging technology.
                    </p>
                </div>
                <PressScroller />
            </div>
        </section>
    );
}
