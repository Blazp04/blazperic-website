export default function FeatureGrid2() {
    return (
        <section className="wrapper wrapper--ticks border-t border-nickel grid lg:grid-cols-2" style={{ display: "grid" }}>
            {/* UI/UX Design */}
            <div className="p-5 sm:p-10 flex flex-col gap-3 border-b border-nickel lg:border-b-0 lg:border-r">
                <h5 className="text-heading-5 text-white">UI/UX Design</h5>
                <p className="sm:max-w-[28rem] text-pretty text-grey text-base md:text-lg">
                    Designing intuitive user interfaces with Figma, focusing on user research,
                    wireframing, prototyping, and scalable design systems.
                </p>
                {/* Component mockup */}
                <div className="mt-6 flex flex-col gap-3">
                    <div className="flex gap-3">
                        <div className="flex-1 h-10 rounded-lg bg-ruby/20 border border-ruby/30 flex items-center justify-center text-xs text-vite font-mono">Button</div>
                        <div className="flex-1 h-10 rounded-lg bg-nickel/30 border border-nickel flex items-center justify-center text-xs text-grey font-mono">Input</div>
                        <div className="flex-1 h-10 rounded-lg bg-nickel/30 border border-nickel flex items-center justify-center text-xs text-grey font-mono">Card</div>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-1 h-10 rounded-lg bg-nickel/30 border border-nickel flex items-center justify-center text-xs text-grey font-mono">Modal</div>
                        <div className="flex-1 h-10 rounded-lg bg-ruby/20 border border-ruby/30 flex items-center justify-center text-xs text-vite font-mono">Badge</div>
                        <div className="flex-1 h-10 rounded-lg bg-nickel/30 border border-nickel flex items-center justify-center text-xs text-grey font-mono">Toast</div>
                    </div>
                    <div className="flex gap-3">
                        <div className="flex-1 h-10 rounded-lg bg-nickel/30 border border-nickel flex items-center justify-center text-xs text-grey font-mono">Avatar</div>
                        <div className="flex-1 h-10 rounded-lg bg-nickel/30 border border-nickel flex items-center justify-center text-xs text-grey font-mono">Menu</div>
                        <div className="flex-1 h-10 rounded-lg bg-ruby/20 border border-ruby/30 flex items-center justify-center text-xs text-vite font-mono">Table</div>
                    </div>
                </div>
            </div>

            {/* TypeScript Expertise */}
            <div className="flex flex-col gap-3 justify-between border-b border-nickel lg:border-b-0">
                <div className="p-5 sm:p-10 flex flex-col gap-3">
                    <h5 className="text-heading-5 text-white">TypeScript First</h5>
                    <p className="max-w-[26rem] text-pretty text-grey text-base md:text-lg">
                        End-to-end type safety across the full stack. Strong typing, generics,
                        and advanced patterns for bulletproof code.
                    </p>
                </div>
                <div className="relative p-5 sm:p-10 flex justify-center" style={{ background: "linear-gradient(135deg, #0F1F38 0%, #0A1628 100%)" }}>
                    <div className="w-full max-w-sm bg-slate border border-nickel rounded-lg overflow-hidden shadow-2xl">
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-nickel bg-midnight">
                            <span className="text-grey text-xs font-mono">types.ts</span>
                        </div>
                        <div className="p-4 font-mono text-xs leading-relaxed">
                            <div><span className="text-ruby">interface</span> <span className="text-vite">Developer</span> <span className="text-grey">{"{"}</span></div>
                            <div className="pl-4"><span className="text-white">name</span><span className="text-grey">:</span> <span className="text-vite">string</span></div>
                            <div className="pl-4"><span className="text-white">skills</span><span className="text-grey">:</span> <span className="text-vite">TechStack</span><span className="text-grey">[]</span></div>
                            <div className="pl-4"><span className="text-white">available</span><span className="text-grey">:</span> <span className="text-vite">true</span></div>
                            <div><span className="text-grey">{"}"}</span></div>
                            <div className="mt-2"><span className="text-ruby">type</span> <span className="text-vite">TechStack</span> <span className="text-grey">=</span></div>
                            <div className="pl-4"><span className="text-grey">|</span> <span className="text-zest">'React'</span> <span className="text-grey">|</span> <span className="text-zest">'Next.js'</span></div>
                            <div className="pl-4"><span className="text-grey">|</span> <span className="text-zest">'Node.js'</span> <span className="text-grey">|</span> <span className="text-zest">'TypeScript'</span></div>
                            <div className="pl-4"><span className="text-grey">|</span> <span className="text-zest">'PostgreSQL'</span> <span className="text-grey">|</span> <span className="text-zest">'AWS'</span></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Development */}
            <div className="p-5 sm:p-10 flex flex-col gap-3 border-b border-nickel lg:border-b-0 lg:border-r">
                <h5 className="text-heading-5 text-white">Mobile Development</h5>
                <p className="sm:max-w-[28rem] text-pretty text-grey text-base md:text-lg mb-8 sm:mb-12">
                    Cross-platform mobile apps with React Native and Expo, delivering
                    native-like experiences on iOS and Android from a single codebase.
                </p>
                {/* Phone mockup */}
                <div className="flex justify-center">
                    <div className="w-48 bg-slate border border-nickel rounded-2xl overflow-hidden shadow-2xl">
                        <div className="h-6 bg-midnight flex items-center justify-center">
                            <div className="w-16 h-1.5 rounded-full bg-nickel" />
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="h-6 bg-ruby/20 rounded-md" />
                            <div className="h-20 bg-nickel/30 rounded-md" />
                            <div className="flex gap-2">
                                <div className="flex-1 h-8 bg-nickel/30 rounded-md" />
                                <div className="flex-1 h-8 bg-ruby/20 rounded-md" />
                            </div>
                            <div className="h-4 bg-nickel/20 rounded w-3/4" />
                            <div className="h-4 bg-nickel/20 rounded w-1/2" />
                        </div>
                        <div className="h-8 bg-midnight flex items-center justify-center">
                            <div className="w-8 h-1 rounded-full bg-nickel" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Optimization */}
            <div className="flex flex-col gap-3 justify-between">
                <div className="p-5 sm:p-10 flex flex-col gap-3">
                    <h5 className="text-heading-5 text-white">Performance Optimization</h5>
                    <p className="max-w-[25rem] text-pretty text-grey text-base md:text-lg">
                        Ensuring fast load times, optimal bundle sizes, and smooth interactions.
                        Core Web Vitals champion.
                    </p>
                </div>
                <div className="px-5 sm:px-10 pb-5 sm:pb-10 flex justify-center">
                    {/* Metrics */}
                    <div className="w-full grid grid-cols-3 gap-4">
                        <div className="bg-slate border border-nickel rounded-lg p-4 text-center">
                            <div className="text-2xl font-medium text-zest">98</div>
                            <div className="text-xs text-grey font-mono mt-1">Perf Score</div>
                        </div>
                        <div className="bg-slate border border-nickel rounded-lg p-4 text-center">
                            <div className="text-2xl font-medium text-zest">0.8s</div>
                            <div className="text-xs text-grey font-mono mt-1">LCP</div>
                        </div>
                        <div className="bg-slate border border-nickel rounded-lg p-4 text-center">
                            <div className="text-2xl font-medium text-zest">0.02</div>
                            <div className="text-xs text-grey font-mono mt-1">CLS</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
