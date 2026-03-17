import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import projectData from "../../db/project.json";
import prizesData from "../../db/prizes.json";
import certificatesData from "../../db/certificates.json";

/* ═══════════════════════════════════════════════════════
   D A T A
   ═══════════════════════════════════════════════════════ */

interface Item {
    title: string;
    description: string;
    category: string;
    date: string;
    url?: string;
    tags?: string[];
    highlight?: string;
}

/* ── Projects ───────────────────────────────────────── */
const PROJECT_CATEGORIES = ["All", "Personal", "Open Source", "Freelance", "Hobby", "Website"] as const;
const PROJECTS: Item[] = projectData.quickLinks;

/* ── Prizes & Awards ────────────────────────────────── */
const AWARD_CATEGORIES = ["All", "Hackathon", "Startup Award", "Academic", "Competition"] as const;
const AWARDS: Item[] = prizesData;

/* ── Certificates ───────────────────────────────────── */
const CERT_CATEGORIES = ["All", "Technical", "Business", "Participation", "Course"] as const;
const CERTIFICATES: Item[] = certificatesData;

/* ═══════════════════════════════════════════════════════
   S E C T I O N   C O N F I G
   ═══════════════════════════════════════════════════════ */

interface SectionConfig {
    key: string;
    label: string;
    color: string;
    description: string;
    items: Item[];
    categories: readonly string[];
    total: string;
    hint: string;
}

const SECTIONS: SectionConfig[] = [
    {
        key: "projects",
        label: "All Projects",
        color: "#22FF73",
        description: "View complete portfolio",
        items: PROJECTS,
        categories: PROJECT_CATEGORIES,
        total: `${PROJECTS.length} projects`,
        hint: "Search projects, tech, categories...",
    },
    {
        key: "awards",
        label: "Prizes & Awards",
        color: "#FBBF24",
        description: "Competitions & recognition",
        items: AWARDS,
        categories: AWARD_CATEGORIES,
        total: `${AWARDS.length} awards`,
        hint: "Search awards, events, dates...",
    },
    {
        key: "certs",
        label: "Certificates",
        color: "#22D3EE",
        description: "Credentials & qualifications",
        items: CERTIFICATES,
        categories: CERT_CATEGORIES,
        total: `${CERTIFICATES.length} certificates`,
        hint: "Search certificates, issuers...",
    },
];

/* ═══════════════════════════════════════════════════════
   D I A L O G
   ═══════════════════════════════════════════════════════ */

function QuickLinksDialog({
    section,
    open,
    onClose,
}: {
    section: SectionConfig;
    open: boolean;
    onClose: () => void;
}) {
    const [query, setQuery] = useState("");
    const [visibleCategory, setVisibleCategory] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const headingRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    useEffect(() => {
        if (open) {
            setQuery("");
            setVisibleCategory("All");
            setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    /* ── filter by search only (no category filter) ── */
    const filtered = section.items.filter((item) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            item.date.toLowerCase().includes(q) ||
            (item.tags && item.tags.some((t) => t.toLowerCase().includes(q))) ||
            (item.highlight && item.highlight.toLowerCase().includes(q))
        );
    });

    /* ── group filtered items by category (preserving order) ── */
    const realCategories = section.categories.filter((c) => c !== "All");
    const grouped = useMemo(() => {
        const map = new Map<string, Item[]>();
        for (const cat of realCategories) map.set(cat, []);
        for (const item of filtered) {
            const bucket = map.get(item.category);
            if (bucket) bucket.push(item);
        }
        return [...map.entries()].filter(([, items]) => items.length > 0);
    }, [filtered, realCategories]);

    /* ── Scroll-driven highlight: detect which section heading is nearest the top ── */
    useEffect(() => {
        if (!open) return;
        const container = scrollRef.current;
        if (!container) return;

        const update = () => {
            const headings = [...headingRefs.current.entries()];
            if (headings.length === 0) return;

            // Check if scrolled to the very bottom → last category
            const atBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - 4;
            if (atBottom) {
                setVisibleCategory(headings[headings.length - 1][0]);
                return;
            }

            // Find the last heading whose top is at or above a small offset from container top
            let current = headings[0][0];
            for (const [cat, el] of headings) {
                const top = el.getBoundingClientRect().top - container.getBoundingClientRect().top;
                if (top <= 8) current = cat;
            }
            setVisibleCategory(current);
        };

        // Initial highlight
        requestAnimationFrame(update);

        container.addEventListener("scroll", update, { passive: true });
        return () => container.removeEventListener("scroll", update);
    }, [open, grouped]);

    const countFor = (cat: string) =>
        cat === "All" ? filtered.length : filtered.filter((i) => i.category === cat).length;

    if (!open) return null;

    return (
        <div
            ref={backdropRef}
            className="fixed inset-0 z-[9999] flex items-start justify-center"
            onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
        >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]" />

            <div
                className="relative w-full max-w-4xl mx-4 mt-[5vh] mb-8 max-h-[90vh] flex flex-col border border-nickel overflow-hidden animate-[dialogSlideIn_250ms_ease-out]"
                style={{ background: "var(--color-primary)" }}
            >
                {/* Section header */}
                <div className="px-5 sm:px-8 pt-6 pb-5 border-b border-nickel">
                    <div className="flex items-center justify-between gap-4">
                        <h3 className="text-heading-5 text-white">{section.label}</h3>
                        <button
                            onClick={onClose}
                            className="shrink-0 text-xs font-mono text-grey/50 hover:text-white transition-colors px-2 py-1 border border-nickel/40 hover:border-nickel cursor-pointer"
                        >
                            Esc
                        </button>
                    </div>
                    <p className="text-grey text-sm font-mono mt-1">{section.description}</p>
                </div>

                {/* Search bar */}
                <div className="flex items-center gap-3 px-5 sm:px-8 py-3 border-b border-nickel/60">
                    <span className="text-grey/40 text-xs font-mono select-none">$</span>
                    <span className="text-grey/40 text-xs font-mono select-none">grep -i</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="..."
                        className="flex-1 bg-transparent text-white text-sm font-mono placeholder:text-grey/30 outline-none"
                    />
                    <span className="text-[10px] font-mono text-grey/30 shrink-0 hidden sm:block">
                        {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Body → sidebar + results */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Category sidebar — passive, scroll-driven */}
                    <div className="hidden sm:flex flex-col w-44 border-r border-nickel py-5 px-4 gap-0.5 overflow-y-auto shrink-0">
                        <span className="text-[10px] font-mono text-grey/30 uppercase tracking-widest mb-2">
                            // categories
                        </span>
                        {realCategories.map((cat) => {
                            const isActive = visibleCategory === cat;
                            const count = countFor(cat);
                            if (count === 0) return null;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => {
                                        const el = headingRefs.current.get(cat);
                                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }}
                                    className="flex items-center justify-between py-2 text-xs font-mono transition-all duration-300 cursor-pointer"
                                    style={{
                                        color: isActive ? "#ffffff" : "rgba(134,126,142,0.35)",
                                        fontWeight: isActive ? 500 : 400,
                                        borderLeft: isActive ? `2px solid ${section.color}` : "none",
                                        paddingLeft: isActive ? "10px" : "12px",
                                    }}
                                >
                                    <span>{cat}</span>
                                    <span
                                        className="text-[10px] tabular-nums"
                                        style={{ color: isActive ? "rgba(134,126,142,0.6)" : "rgba(134,126,142,0.2)" }}
                                    >
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Results list — grouped by category */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3">
                                <span className="text-sm font-mono text-grey/40">
                                    // no matches for "{query}"
                                </span>
                            </div>
                        ) : (
                            <div>
                                {grouped.map(([cat, items]) => (
                                    <div key={cat}>
                                        {/* Category divider — sticky */}
                                        <div
                                            ref={(el) => { if (el) headingRefs.current.set(cat, el); }}
                                            data-category={cat}
                                            className="sticky top-0 z-10 px-5 sm:px-8 py-2.5 border-b border-nickel/40"
                                            style={{ background: "var(--color-primary)" }}
                                        >
                                            <span
                                                className="text-[11px] font-mono font-semibold uppercase tracking-widest"
                                                style={{ color: section.color }}
                                            >
                                                {cat}
                                            </span>
                                            <span className="text-[10px] font-mono text-grey/30 tabular-nums ml-2">
                                                {items.length}
                                            </span>
                                        </div>

                                        {items.map((item, i) => (
                                            <div
                                                key={i}
                                                className="group flex flex-col gap-2.5 px-5 sm:px-8 py-6 hover:bg-white/[0.02] transition-colors"
                                            >
                                                <div className="flex items-center gap-2.5 flex-wrap">
                                                    <span className="text-[11px] font-mono text-grey/40">{item.date}</span>
                                                    {item.highlight && (
                                                        <span
                                                            className="text-[10px] font-mono px-1.5 py-0.5 border ml-auto"
                                                            style={{
                                                                color: section.color,
                                                                borderColor: `${section.color}30`,
                                                            }}
                                                        >
                                                            {item.highlight}
                                                        </span>
                                                    )}
                                                </div>

                                                {item.url ? (
                                                    <a
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-base text-white/90 hover:text-white transition-colors leading-snug"
                                                    >
                                                        {item.title}
                                                    </a>
                                                ) : (
                                                    <span className="text-base text-white/90 leading-snug">{item.title}</span>
                                                )}

                                                <p className="text-sm text-grey/50 leading-relaxed">{item.description}</p>

                                                {item.tags && item.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                                        {item.tags.map((tag) => (
                                                            <span
                                                                key={tag}
                                                                className="text-[10px] font-mono px-2 py-0.5 border border-nickel/40 text-grey/50"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer — terminal-style */}
                <div className="px-5 sm:px-8 py-3 border-t border-nickel flex items-center justify-between">
                    <span className="text-[10px] font-mono text-grey/30">
                        {section.total} · {grouped.length} categories
                    </span>
                    <span className="text-[10px] font-mono text-grey/30 hidden sm:block">
                        scroll to browse · esc to close
                    </span>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   A R R O W   I C O N
   ═══════════════════════════════════════════════════════ */

function ArrowIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="opacity-40 group-hover:opacity-80 transition-opacity"
        >
            <path
                d="M5.5 3.5H12.5V10.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M12.5 3.5L3.5 12.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/* ═══════════════════════════════════════════════════════
   M A I N   C O M P O N E N T
   ═══════════════════════════════════════════════════════ */

export default function QuickLinks() {
    const [openKey, setOpenKey] = useState<string | null>(null);
    const activeSection = SECTIONS.find((s) => s.key === openKey) ?? null;
    const closeDialog = useCallback(() => setOpenKey(null), []);

    return (
        <>
            <section className="wrapper wrapper--ticks border-t border-nickel">
                <div className="grid grid-cols-3">
                    {SECTIONS.map((section, i) => (
                        <button
                            key={section.key}
                            onClick={() => setOpenKey(section.key)}
                            className="group relative flex flex-col items-center justify-center gap-2.5 cursor-pointer"
                            style={{
                                padding: "5rem 1.25rem",
                                ...(i < SECTIONS.length - 1
                                    ? { borderRight: "1px solid var(--color-nickel)" }
                                    : {}),
                            }}
                        >
                            {/* Hover bg overlay — inline to bypass CSS reset */}
                            <span
                                className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                            />
                            <span
                                className="text-sm sm:text-base font-mono font-medium tracking-wide"
                                style={{ color: section.color }}
                            >
                                {section.label}
                            </span>
                            <span className="text-grey/40 text-xs font-mono hidden sm:block">
                                {section.description}
                            </span>
                            <span className="text-grey/50 mt-1">
                                <ArrowIcon />
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {activeSection && (
                <QuickLinksDialog
                    section={activeSection}
                    open={!!openKey}
                    onClose={closeDialog}
                />
            )}
        </>
    );
}
