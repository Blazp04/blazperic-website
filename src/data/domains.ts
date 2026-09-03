export interface DomainInfo {
    id: string;
    label: string;
    description: string;
    color: string;
    colorMuted: string;
}

export const domains: DomainInfo[] = [
    {
        id: "frontend",
        label: "React / Frontend",
        description:
            "Interfaces in React and TypeScript, shaped around the decision a user needs to make—not the component library underneath.",
        color: "#61DAFB",
        colorMuted: "rgba(97,218,251,0.10)",
    },
    {
        id: "backend",
        label: ".NET / Backend",
        description:
            "APIs and services in .NET, with data models and integrations that keep a product reliable past the first demo.",
        color: "#8B5CF6",
        colorMuted: "rgba(139,92,246,0.10)",
    },
    {
        id: "mobile",
        label: "Flutter / Mobile",
        description:
            "Cross-platform Flutter apps for workflows that need to travel—built for Android and iOS from one focused codebase.",
        color: "#06B6D4",
        colorMuted: "rgba(6,182,212,0.10)",
    },
    {
        id: "ai",
        label: "AI / LLM Research",
        description:
            "Prototyping RAG, agents, and private knowledge tools—then testing where an LLM helps and where conventional software wins.",
        color: "#F59E0B",
        colorMuted: "rgba(245,158,11,0.10)",
    },
];
