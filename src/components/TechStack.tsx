const techGroups = [
    { category: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Vue.js", "Svelte"] },
    { category: "Backend", items: ["Node.js", "Express", "Python", "Go", "GraphQL", "REST"] },
    { category: "Database", items: ["PostgreSQL", "MongoDB", "Redis", "Prisma", "Supabase", "Firebase"] },
    { category: "DevOps", items: ["AWS", "Docker", "Vercel", "GitHub Actions", "Terraform", "K8s"] },
];

export default function TechStack() {
    return (
        <section className="wrapper wrapper--ticks border-t border-nickel py-8 sm:py-16 px-5 sm:px-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                {techGroups.map((group) => (
                    <div key={group.category}>
                        <p className="text-ruby text-xs font-mono uppercase tracking-wide mb-5">
                            /{group.category}
                        </p>
                        <ul className="flex flex-col gap-3">
                            {group.items.map((item, i) => (
                                <li key={item} className="text-white text-sm md:text-base flex items-center gap-2">
                                    <span className="text-nickel font-mono text-xs shrink-0">
                                        {i === group.items.length - 1 ? '└──' : '├──'}
                                    </span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
}
