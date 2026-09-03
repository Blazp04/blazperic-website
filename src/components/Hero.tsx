import { lazy, Suspense } from "react";

const Lanyard = lazy(() => import("./Lanyard"));

export default function Hero() {
    return (
        <section className="wrapper wrapper--ticks grid md:grid-cols-2 w-full border-t border-nickel md:divide-x md:divide-nickel pt-20">
            <div className="flex flex-col p-8 sm:p-10 justify-center gap-12 items-center md:items-start">
                <div className="flex flex-col gap-5 items-center md:items-start text-center md:text-left">
                    <div className="flex items-center gap-2">
                        <span className="text-grey text-xs font-mono uppercase tracking-wide">
                            Based in
                        </span>
                        <span className="text-white text-xs font-mono uppercase tracking-wide">
                            Mostar, Bosnia and Herzegovina
                        </span>
                    </div>

                    <h1 className="text-heading-1 text-white max-w-[31rem] text-pretty">
                        From React screens to drones in the field.
                    </h1>

                    <p className="text-white/70 md:text-lg max-w-[31rem] text-pretty leading-relaxed">
                        I’m Blaž Perić. I build React and Flutter products, .NET backends,
                        and LLM prototypes—often for agriculture, education, and tools that
                        have to work beyond the demo.
                    </p>

                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-6">
                        <a href="#projects" className="button button--primary">
                            <span>Explore selected work</span>
                        </a>
                        <a href="mailto:hello@blazperic.com" className="button">
                            Email me
                        </a>
                    </div>
                </div>
            </div>

            <div className="relative min-h-[34rem] px-2 sm:px-6 flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 opacity-70 pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(circle at 52% 48%, rgba(59,130,246,0.13), transparent 44%)",
                    }}
                />
                <Suspense
                    fallback={<div className="h-[34rem] w-full animate-pulse bg-white/[0.015]" />}
                >
                    <Lanyard cameraDistance={22} />
                </Suspense>
            </div>
        </section>
    );
}
