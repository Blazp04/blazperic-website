import { domains } from "../data/domains";

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
                    Choose a layer. Watch the system reorganize.
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
                                    className="absolute bottom-0 left-0 right-0 h-[2px] transition-[opacity,background-color] duration-300"
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
