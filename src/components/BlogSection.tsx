import { useRef, useEffect, useCallback } from "react";
import { BLOG_POSTS } from "../data/blogPosts";

/* ═══════════════════════════════════════════════════════
   Mini particle canvas for the blog preview card
   ═══════════════════════════════════════════════════════ */
function MiniParticleCanvas({ color = "rgba(59,130,246,0.6)" }: { color?: string }) {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        let raf: number;
        const dpr = window.devicePixelRatio || 1;

        // Offscreen canvas for compositing
        const off = document.createElement("canvas");
        const octx = off.getContext("2d")!;

        const resize = () => {
            const r = canvas.getBoundingClientRect();
            canvas.width = r.width * dpr;
            canvas.height = r.height * dpr;
            off.width = canvas.width;
            off.height = canvas.height;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            octx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();

        interface P {
            x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number;
        }
        const particles: P[] = [];

        const spawn = (w: number, h: number) => {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.6,
                vy: -Math.random() * 0.8 - 0.2,
                life: 0,
                maxLife: 80 + Math.random() * 60,
                size: 2 + Math.random() * 3,
            });
        };

        const draw = () => {
            const r = canvas.getBoundingClientRect();
            const w = r.width, h = r.height;
            const fontSize = Math.min(w, h) * 0.75;

            // Spawn particles
            for (let s = 0; s < 3; s++) {
                if (particles.length < 400) spawn(w, h);
            }

            // Update particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy -= 0.003;
                p.life++;
                if (p.life >= p.maxLife) particles.splice(i, 1);
            }

            // Draw particles onto offscreen canvas
            octx.clearRect(0, 0, w, h);
            octx.globalCompositeOperation = "source-over";
            for (const p of particles) {
                const t = p.life / p.maxLife;
                const alpha = t < 0.1 ? t / 0.1 : 1 - (t - 0.1) / 0.9;
                if (alpha <= 0) continue;
                octx.beginPath();
                octx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                octx.fillStyle = color.replace(/[\d.]+\)$/, `${(alpha * 0.9).toFixed(2)})`);
                octx.fill();
            }

            // Mask: keep only particles inside "?" shape
            octx.globalCompositeOperation = "destination-in";
            octx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
            octx.textAlign = "center";
            octx.textBaseline = "middle";
            octx.fillStyle = "white";
            octx.fillText("?", w / 2, h / 2);

            // Main canvas: draw outline + composited particles
            ctx.clearRect(0, 0, w, h);
            ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.strokeStyle = "rgba(59,130,246,0.15)";
            ctx.lineWidth = 1;
            ctx.strokeText("?", w / 2, h / 2);
            ctx.drawImage(off, 0, 0, w * dpr, h * dpr, 0, 0, w, h);

            raf = requestAnimationFrame(draw);
        };
        draw();
        return () => cancelAnimationFrame(raf);
    }, [color]);

    return <canvas ref={ref} className="absolute inset-0 w-full h-full" style={{ opacity: 0.85 }} />;
}

/* ═══════════════════════════════════════════════════════
   Blog card data
   ═══════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════
   Arrow icon
   ═══════════════════════════════════════════════════════ */
const ArrowIcon = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M5.5 3.5H12.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12.5 3.5L3.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

/* ═══════════════════════════════════════════════════════
   Blog Section – homepage preview
   ═══════════════════════════════════════════════════════ */
export default function BlogSection() {
    const sectionRef = useRef<HTMLDivElement>(null);

    /* Fade-in on scroll */
    const handleScroll = useCallback(() => {
        const el = sectionRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.85) {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
        }
    }, []);

    useEffect(() => {
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    const post = BLOG_POSTS[0];

    return (
        <section id="blog" className="wrapper wrapper--ticks border-t border-nickel">
            {/* Section header */}
            <div className="p-5 sm:p-10 flex flex-col gap-3 border-b border-nickel">

                <h3 className="text-heading-3 text-white">Thinking Out Loud</h3>
                <p className="text-grey text-sm max-w-xl">
                    Notes, ideas, and things I'm exploring.
                </p>
            </div>

            {/* Blog card */}
            <div
                ref={sectionRef}
                className="transition-all duration-700"
                style={{ opacity: 0, transform: "translateY(20px)" }}
            >
                <a
                    href={`/blog/${post.slug}`}
                    className="group block"
                    style={{ textDecoration: "none", color: "inherit" }}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-5">
                        {/* Particle preview */}
                        <div className="relative lg:col-span-2 min-h-[240px] sm:min-h-[280px] overflow-hidden border-b lg:border-b-0 lg:border-r border-nickel"
                            style={{ background: "radial-gradient(ellipse at center, rgba(59,130,246,0.04) 0%, transparent 70%)" }}
                        >
                            <MiniParticleCanvas color="rgba(59,130,246,0.6)" />
                        </div>

                        {/* Content */}
                        <div className="lg:col-span-3 p-6 sm:p-10 flex flex-col justify-center gap-4 relative">
                            {/* Hover overlay */}
                            <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ backgroundColor: "rgba(255,255,255,0.02)" }} />

                            <div className="flex items-center gap-3 flex-wrap">
                                {post.tags.map((tag) => (
                                    <span key={tag} className="text-[10px] font-mono tracking-wider uppercase border border-nickel/60 px-2 py-0.5 text-grey/60">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <h4 className="text-heading-4 text-white group-hover:text-ruby transition-colors duration-300">
                                {post.title}
                            </h4>

                            <p className="text-grey text-sm leading-relaxed max-w-md">
                                {post.description}
                            </p>

                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-grey/40 text-xs font-mono">{post.date}</span>
                                <span className="text-grey/30">·</span>
                                <span className="text-grey/40 text-xs font-mono">{post.readTime}</span>
                            </div>

                            <div className="flex items-center gap-2 mt-2 text-ruby/60 group-hover:text-ruby transition-colors duration-300 text-xs font-mono">
                                Read article <ArrowIcon />
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        </section>
    );
}
