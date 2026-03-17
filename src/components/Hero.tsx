export default function Hero() {
    return (
        <div className="wrapper wrapper--ticks grid md:grid-cols-2 w-full border-t border-nickel md:divide-x md:divide-nickel pt-20">
            {/* Left: Text content */}
            <div className="flex flex-col p-8 sm:p-10 justify-between gap-16 items-center md:items-start">
                <div className="flex flex-col gap-5 items-center md:items-start text-center md:text-left">
                    <div className="flex items-center gap-2">
                        <span className="text-grey text-xs font-mono uppercase tracking-wide">
                            Based in
                        </span>
                        <span className="text-white text-xs font-mono uppercase tracking-wide">
                            Mostar, Bosnia and Herzegovina
                        </span>
                    </div>

                    <h1 className="text-heading-1 text-white max-w-[25rem] text-pretty">
                        Building systems, not just interfaces.
                    </h1>

                    <p className="text-white/70 md:text-lg max-w-[27rem] text-pretty">
                        I design and build modern web applications focused on performance,
                        clarity and real-world impact. From frontend experiences to backend
                        architecture, I care about software that actually solves problems.
                    </p>

                    <div className="flex items-center gap-5 mt-8">
                        <a href="#projects" className="button button--primary">
                            <span>View Projects</span>
                        </a>
                        <a
                            href="#contact"
                            className="button"
                        >
                            Get in Touch
                        </a>
                    </div>
                </div>


            </div>

            {/* Right: Visual */}
            <div className="flex flex-col sm:min-h-[30rem]">
                <div className="relative px-10 pb-10 md:pt-10 h-full flex flex-col justify-center overflow-clip">
                    {/* Abstract visual / code art */}
                    <div className="relative w-full aspect-square max-w-md mx-auto flex items-center justify-center">
                        {/* Animated gradient background */}
                        <div
                            className="absolute inset-0 rounded-2xl opacity-30"
                            style={{
                                background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 25%, #0A1628 50%, #3B82F6 75%, #93C5FD 100%)",
                                backgroundSize: "200% 200%",
                                animation: "move-background 16s ease-in-out infinite",
                            }}
                        />

                        {/* Grid overlay */}
                        <div
                            className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage: `linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)`,
                                backgroundSize: "40px 40px",
                            }}
                        />

                        {/* Code blocks floating */}
                        <div className="relative z-10 space-y-4 w-full px-4">
                            <div className="bg-slate/80 backdrop-blur border border-nickel rounded-lg p-4 transform -rotate-2">
                                <div className="font-mono text-xs space-y-1">
                                    <div><span className="text-ruby">const</span> <span className="text-vite">developer</span> <span className="text-grey">=</span> <span className="text-grey">{"{"}</span></div>
                                    <div className="pl-4"><span className="text-white">name</span><span className="text-grey">:</span> <span className="text-zest">'Blaž Perić'</span><span className="text-grey">,</span></div>
                                    <div className="pl-4"><span className="text-white">role</span><span className="text-grey">:</span> <span className="text-zest">'Full-Stack Dev'</span><span className="text-grey">,</span></div>
                                    <div className="pl-4"><span className="text-white">passion</span><span className="text-grey">:</span> <span className="text-zest">'Building great UX'</span></div>
                                    <div><span className="text-grey">{"}"}</span></div>
                                </div>
                            </div>

                            <div className="bg-slate/80 backdrop-blur border border-nickel rounded-lg p-4 transform rotate-1 ml-8">
                                <div className="font-mono text-xs space-y-1">
                                    <div><span className="text-ruby">export default</span> <span className="text-vite">function</span> <span className="text-white">App</span><span className="text-grey">()</span> <span className="text-grey">{"{"}</span></div>
                                    <div className="pl-4"><span className="text-ruby">return</span> <span className="text-grey">&lt;</span><span className="text-vite">Portfolio</span> <span className="text-grey">/&gt;</span></div>
                                    <div><span className="text-grey">{"}"}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
