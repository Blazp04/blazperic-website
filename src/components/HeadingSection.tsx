import type { ReactNode } from "react";

interface HeadingSectionProps {
    heading: string;
    subheading?: string;
    id?: string;
    command?: string;
    children?: ReactNode;
}

export default function HeadingSection({ heading, subheading, id, command, children }: HeadingSectionProps) {
    return (
        <section
            id={id}
            className="wrapper wrapper--ticks border-t border-nickel px-5 sm:px-10 py-14 sm:py-28 flex flex-col justify-center gap-3 text-center items-center relative overflow-hidden"
        >
            {/* Background layer (particle canvas etc.) */}
            {children}

            {/* Content — sits above canvas but lets pointer events pass through */}
            <div className="relative z-10 flex flex-col justify-center gap-3 text-center items-center pointer-events-none">
                {command && (
                    <div className="terminal-prompt mb-2">
                        <span>{command}</span>
                        <span className="terminal-cursor" />
                    </div>
                )}
                <h2 className="text-heading-2 text-white max-w-2xl text-balance text-center">
                    {heading}
                </h2>
                {subheading && (
                    <p className="max-w-md text-white/70 text-balance sm:text-pretty text-base md:text-lg">
                        {subheading}
                    </p>
                )}
            </div>
        </section>
    );
}
