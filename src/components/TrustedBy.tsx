export interface DomainInfo {
    id: string;
    label: string;
    description: string;
    color: string;
    colorMuted: string;
}

export const domains: DomainInfo[] = [
    {
        id: "mobile",
        label: "Flutter / Mobile",
        description:
            "Building high-performance cross-platform apps (Android & iOS) that feel native and scale effortlessly.",
        color: "#06B6D4",
        colorMuted: "rgba(6,182,212,0.10)",
    },
    {
        id: "backend",
        label: "Node.js / Backend",
        description:
            "Architecting resilient backends and automated pipelines that handle complex data flows in real-time.",
        color: "#22C55E",
        colorMuted: "rgba(34,197,94,0.10)",
    },
    {
        id: "ai",
        label: "AI / LLM",
        description:
            "Designing intelligent agents and custom LLM pipelines, from fine-tuned models to production RAG systems that actually reason about your domain.",
        color: "#A855F7",
        colorMuted: "rgba(168,85,247,0.10)",
    },
    {
        id: "research",
        label: "Research / Experiments",
        description:
            "Tinkering at the edge, exploring novel architectures, creative tooling, and uncharted ideas before they become mainstream.",
        color: "#F59E0B",
        colorMuted: "rgba(245,158,11,0.10)",
    },
];

interface TrustedByProps {
    activeDomain: string | null;
    onDomainChange: (id: string | null) => void;
}

export default function TrustedBy({ activeDomain, onDomainChange }: TrustedByProps) {
    return (
        <>
            {/* Title */}
            <section className="wrapper wrapper--ticks border-t border-nickel px-5 sm:px-10 py-6 md:py-8 flex flex-col justify-center gap-5">
                <h6 className="text-heading-6 text-center md:text-start text-white">
                    Building Systems, Not Just Code
                </h6>
            </section>

            {/* Domain pills — hoverable row */}
            <section className="wrapper wrapper--ticks border-t border-nickel">
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-nickel">
                    {domains.map((domain) => {
                        const isActive = activeDomain === domain.id;
                        return (
                            <div
                                key={domain.id}
                                className="trusted-domain-pill"
                                style={{
                                    "--pill-color": domain.color,
                                    "--pill-muted": domain.colorMuted,
                                    background: isActive ? domain.colorMuted : undefined,
                                } as React.CSSProperties}
                                onMouseEnter={() => onDomainChange(domain.id)}
                                onMouseLeave={() => onDomainChange(null)}
                            >
                                <span
                                    className="text-sm font-medium tracking-wide transition-colors duration-200"
                                    style={{
                                        color: isActive ? domain.color : "var(--color-grey)",
                                    }}
                                >
                                    {domain.label}
                                </span>

                                {/* Animated bottom bar */}
                                <span
                                    className="absolute bottom-0 left-0 right-0 h-[2px] transition-all duration-300"
                                    style={{
                                        background: isActive ? domain.color : "transparent",
                                        opacity: isActive ? 1 : 0,
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            </section>
        </>
    );
}
