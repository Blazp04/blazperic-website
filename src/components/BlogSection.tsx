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
        <div className="precache-preview" aria-hidden="true">
            <svg viewBox="0 0 560 210" fill="none" className="w-full h-full">
                <path d="M0 52H560M0 105H560M0 158H560M80 0V210M200 0V210M320 0V210M440 0V210" stroke="#3B3440" strokeOpacity=".25" />
                <rect x="45" y="67" width="132" height="76" fill="#16171d" stroke="#3B3440" />
                <path d="M59 89H83M59 101H100M59 113H74" stroke="#3B82F6" strokeWidth="2" />
                <text x="59" y="132" fill="#c0b9c8" fontFamily="monospace" fontSize="10">BUNDLED DATA</text>
                <path d="M177 105H278" stroke="#3B82F6" strokeOpacity=".6" />
                <path d="M271 101L278 105L271 109" stroke="#3B82F6" />
                <circle className="precache-packet" cx="184" cy="105" r="3" fill="#93C5FD" />
                <text x="198" y="92" fill="#93C5FD" fontFamily="monospace" fontSize="10">read locally</text>
                <rect x="285" y="29" width="130" height="152" rx="8" fill="#14121A" stroke="#3B3440" />
                <path d="M335 39H365" stroke="#3B3440" strokeWidth="3" strokeLinecap="round" />
                <text x="299" y="65" fill="#f4f3ec" fontSize="11" fontFamily="system-ui">Choose a vehicle</text>
                {[80, 111, 142].map((y, i) => (
                    <g key={y}>
                        <rect x="299" y={y} width="23" height="22" fill="#3B82F6" fillOpacity=".12" stroke="#3B82F6" strokeOpacity=".35" />
                        <path d={`M305 ${y + 14}V${y + 9}H317V${y + 14}M307 ${y + 9}L309 ${y + 6}H313L315 ${y + 9}`} stroke="#93C5FD" />
                        <circle cx="308" cy={y + 15} r="1.5" fill="#93C5FD" /><circle cx="314" cy={y + 15} r="1.5" fill="#93C5FD" />
                        <path d={`M331 ${y + 7}H${381 - i * 5}M331 ${y + 15}H${367 + i * 3}`} stroke="#867e8e" strokeWidth="2" strokeOpacity=".6" />
                    </g>
                ))}
                <path d="M111 67V29H280" stroke="#867e8e" strokeOpacity=".5" strokeDasharray="3 5" />
                <text x="136" y="20" fill="#867e8e" fontFamily="monospace" fontSize="9">network checks freshness</text>
                <text x="435" y="96" fill="#93C5FD" fontFamily="monospace" fontSize="10">FIRST</text>
                <text x="435" y="111" fill="#93C5FD" fontFamily="monospace" fontSize="10">FRAME</text>
                <path d="M45 195H415" stroke="#3B3440" />
                <text x="45" y="188" fill="#867e8e" fontFamily="monospace" fontSize="8">available before the request finishes</text>
            </svg>
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
