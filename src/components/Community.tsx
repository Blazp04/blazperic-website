const testimonials = [
    {
        name: "Sarah Chen",
        handle: "@sarahchen",
        avatar: "SC",
        comment: [
            "Blaž is an exceptional developer who consistently delivers high-quality work. His attention to detail and ability to translate complex requirements into elegant solutions is remarkable.",
        ],
    },
    {
        name: "Marcus Rodriguez",
        handle: "@marcusrod",
        avatar: "MR",
        comment: [
            "Working with Blaž was a game-changer for our project. He brought innovative ideas to the table and executed them flawlessly.",
            "The codebase he built is clean, well-documented, and maintainable.",
        ],
    },
    {
        name: "Emily Watson",
        handle: "@emilywatson",
        avatar: "EW",
        comment: [
            "Blaž's expertise in frontend performance optimization helped us reduce our load times by 60%. His deep understanding of React and modern web standards is truly impressive.",
        ],
    },
    {
        name: "David Park",
        handle: "@davidpark",
        avatar: "DP",
        comment: [
            "I've worked with many developers over the years, but Blaž stands out for his combination of technical skills and clear communication. He's the kind of developer every team needs.",
        ],
    },
    {
        name: "Lisa Thompson",
        handle: "@lisathompson",
        avatar: "LT",
        comment: [
            "Blaž took our outdated codebase and transformed it into a modern, scalable architecture. The migration was seamless and our development velocity increased dramatically.",
        ],
    },
    {
        name: "Alex Rivera",
        handle: "@alexrivera",
        avatar: "AR",
        comment: [
            "Exceptional problem solver. Blaž debugged an issue in hours that our team spent weeks on. Would absolutely hire again.",
        ],
    },
    {
        name: "Nina Patel",
        handle: "@ninapatel",
        avatar: "NP",
        comment: [
            "Blaž built our entire design system from scratch. 60+ components, all accessible, all documented.",
            "Truly world-class work.",
        ],
    },
    {
        name: "Chris Nakamura",
        handle: "@chrisnaka",
        avatar: "CN",
        comment: [
            "The API architecture Blaž designed handles 10x our original traffic with zero downtime. His backend skills are as strong as his frontend work.",
        ],
    },
    {
        name: "Jordan Lee",
        handle: "@jordanlee",
        avatar: "JL",
        comment: [
            "Wow, just wow. Blaž's code is poetry. Clean, efficient, and a joy to work with. 🤌",
        ],
    },
];

export default function Community() {
    return (
        <div
            id="community"
            className="wrapper wrapper--ticks border-t border-nickel pt-14 sm:pt-30 px-5 sm:px-10"
        >
            {/* Header with stats */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-8 sm:gap-20 text-center sm:text-left">
                <div className="flex flex-col gap-3">
                    <h3 className="text-heading-3 text-white max-w-xl text-balance">
                        Loved by clients & collaborators
                    </h3>
                    <p className="max-w-md text-white/70 text-balance">
                        Don't take my word for it — hear what people I've worked with have to say.
                    </p>
                </div>

                <div className="flex gap-8 sm:gap-12 items-start justify-center sm:justify-start sm:pr-20">
                    <div className="flex flex-col gap-3">
                        <h2 className="text-heading-2 text-white">50+</h2>
                        <p className="text-grey flex items-center gap-2 text-sm">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                <line x1="8" y1="21" x2="16" y2="21" />
                                <line x1="12" y1="17" x2="12" y2="21" />
                            </svg>
                            Projects Delivered
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <h2 className="text-heading-2 text-white">5+</h2>
                        <p className="text-grey text-sm">Years Experience</p>
                    </div>
                </div>
            </div>

            {/* Masonry testimonials - with fade mask at bottom */}
            <div
                className="pt-14 sm:pt-30 h-[50rem] overflow-clip"
                style={{
                    maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
                }}
            >
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="break-inside-avoid mb-5">
                            <div className="testimonial-card">
                                {/* Comment */}
                                <div className="relative z-[2] flex flex-col gap-4">
                                    {testimonial.comment.map((paragraph, pIndex) => (
                                        <p
                                            key={pIndex}
                                            className="text-white/70 leading-relaxed text-sm sm:text-base"
                                        >
                                            {paragraph}
                                        </p>
                                    ))}
                                </div>

                                {/* Author */}
                                <div className="relative z-[2] flex items-center gap-5 mt-auto">
                                    <div className="w-12 h-12 rounded-sm bg-slate border border-nickel flex items-center justify-center shrink-0">
                                        <span className="text-grey text-sm font-mono font-medium">
                                            {testimonial.avatar}
                                        </span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-grey text-sm font-mono">
                                            {testimonial.name}
                                        </span>
                                        <span className="text-beige/50 text-sm font-mono">
                                            {testimonial.handle}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
