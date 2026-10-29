import { useRef, useEffect } from "react";
import { BLOG_POSTS } from "../data/blogPosts";

/* ═══════════════════════════════════════════════════════
   Mini particle canvas for the blog preview card
   ═══════════════════════════════════════════════════════ */
function MiniParticleCanvas({ color = "rgba(59,130,246,0.6)" }: { color?: string }) {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        let raf = 0;
        let visible = true;
        const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

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
            raf = 0;
            if (!visible) return;
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

            if (!motionPreference.matches) raf = requestAnimationFrame(draw);
        };
        const restart = () => {
            cancelAnimationFrame(raf);
            raf = 0;
            resize();
            draw();
        };
        const observer = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible && !raf) draw();
            if (!visible) {
                cancelAnimationFrame(raf);
                raf = 0;
            }
        });
        const resizeObserver = new ResizeObserver(restart);
        observer.observe(canvas);
        resizeObserver.observe(canvas);
        motionPreference.addEventListener("change", restart);
        draw();
        return () => {
            cancelAnimationFrame(raf);
            observer.disconnect();
            resizeObserver.disconnect();
            motionPreference.removeEventListener("change", restart);
        };
    }, [color]);

    return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 w-full h-full" style={{ opacity: 0.85 }} />;
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

function PrecachePreview() {
    return (
        <div className="precache-preview flex flex-col justify-center px-8 gap-3 font-mono text-xs" aria-hidden="true">
            <span className="text-grey">// before the first request finishes</span>
            <span className="text-white">UI → Repository → Controller</span>
            <span className="text-blue-300">                  ├─ typed seed</span>
            <span className="text-grey">                  ├─ Hive</span>
            <span className="text-grey">                  └─ API refresh</span>
        </div>
    );
}

export default function BlogSection() {
    return (
        <section id="blog" className="wrapper wrapper--ticks border-t border-nickel">
            <style>{`
                #blog .precache-preview { width: 100%; height: 100%; }
                #blog .precache-packet { opacity: .7; }
                #blog .blog-preview-link:hover .precache-packet,
                #blog .blog-preview-link:focus-visible .precache-packet { animation: precache-preview-transfer 1.8s ease-in-out infinite; }
                #blog .blog-preview-link:focus-visible { outline: 2px solid #93C5FD; outline-offset: -3px; }
                @keyframes precache-preview-transfer {
                    0% { transform: translateX(0); opacity: 0; }
                    15% { opacity: 1; }
                    85% { opacity: 1; }
                    100% { transform: translateX(86px); opacity: 0; }
                }
                @media (prefers-reduced-motion: reduce) {
                    #blog .precache-packet { animation: none !important; }
                    #blog .blog-preview-link * { transition: none !important; }
                }
            `}</style>
            <div className="p-5 sm:p-10 flex items-end justify-between gap-6 border-b border-nickel">
                <div className="flex flex-col gap-3">
                    <h3 className="text-heading-3 text-white">Build notes</h3>
                    <p className="text-grey text-sm max-w-xl">
                        What happens behind the interface: performance decisions, rendering experiments, and lessons from building real products.
                    </p>
                </div>
                <a href="/blog" className="shrink-0 text-xs font-mono text-grey hover:text-white transition-colors hidden sm:flex items-center gap-2">
                    All notes <ArrowIcon />
                </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
                {BLOG_POSTS.map((post, index) => (
                    <a
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className={`blog-preview-link group flex flex-col ${index > 0 ? "border-t md:border-t-0 md:border-l border-nickel" : ""}`}
                    >
                        <div className="relative h-[180px] sm:h-[210px] overflow-hidden border-b border-nickel bg-slate">
                            {post.slug === "flutter-precache"
                                ? <PrecachePreview />
                                : <MiniParticleCanvas color="rgba(59,130,246,0.6)" />}
                        </div>
                        <div className="p-6 sm:p-8 flex flex-col gap-4 flex-1 group-hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-2 flex-wrap">
                                {post.tags.map((tag) => (
                                    <span key={tag} className="text-[10px] font-mono tracking-wider uppercase border border-nickel/60 px-2 py-0.5 text-grey">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <h4 className="text-xl sm:text-2xl text-white group-hover:text-ruby transition-colors">{post.title}</h4>
                            <p className="text-grey text-sm leading-relaxed">{post.description}</p>
                            <div className="flex items-center gap-3 mt-auto pt-2 text-xs font-mono text-grey">
                                <time dateTime={post.date}>{post.date}</time>
                                <span aria-hidden="true">·</span>
                                <span>{post.readTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-ruby text-xs font-mono">
                                Read article <ArrowIcon />
                            </div>
                        </div>
                    </a>
                ))}
            </div>
        </section>
    );
}
