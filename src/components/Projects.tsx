import projectData from "../../db/project.json";

interface FeaturedProject {
    title: string;
    description: string;
    stack: string[];
    highlight: string;
    color: string;
}

const projects = projectData.featured as FeaturedProject[];

export default function Projects() {
    return (
        <section id="projects" className="wrapper wrapper--ticks border-t border-nickel">
            <div className="grid md:grid-cols-2" style={{ display: "grid" }}>
                {projects.map((project, i) => (
                    <div
                        key={project.title}
                        className={`flex flex-col gap-5 p-5 sm:p-10 ${i % 2 === 0 && i < projects.length - 1 ? "md:border-r border-nickel" : ""
                            } ${i < projects.length - 2 ? "border-b border-nickel" : ""} ${i === projects.length - 2 ? "border-b md:border-b-0 border-nickel" : ""
                            }`}
                    >
                        {/* Project header bar */}
                        <div className="flex items-center gap-3">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: project.color }}
                            />
                            <h5 className="text-heading-5 text-white">{project.title}</h5>
                            <span className="status-badge">deployed</span>
                        </div>

                        <p className="text-grey text-base md:text-lg text-pretty max-w-md">
                            {project.description}
                        </p>

                        {/* Tech stack tags */}
                        <div className="flex flex-wrap gap-2">
                            {project.stack.map((tech) => (
                                <span
                                    key={tech}
                                    className="text-xs font-mono px-2.5 py-1 rounded bg-slate border border-nickel text-grey"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>

                        <div className="mt-auto pt-4">
                            <p className="text-white text-sm font-mono">{project.highlight}</p>
                        </div>

                        {/* Links */}
                        <div className="flex gap-4 pt-2">
                            <a
                                href="#"
                                className="text-sm text-grey hover:text-white transition-colors flex items-center gap-2"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                                </svg>
                                Source Code
                            </a>
                            <a
                                href="#"
                                className="text-sm text-grey hover:text-white transition-colors flex items-center gap-2"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                    <polyline points="15 3 21 3 21 9" />
                                    <line x1="10" y1="14" x2="21" y2="3" />
                                </svg>
                                Live Demo
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
