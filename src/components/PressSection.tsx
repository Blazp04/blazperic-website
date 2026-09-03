import { useState, useEffect, useRef, useCallback } from "react";
import { PRESS, PRESS_ARTICLES as ARTICLES } from "../data/press";
import type { PressArticle } from "../data/press";

const VISIBLE_COUNT = 6;

/* ─── Single article card (flippable if multi-source) ─── */
function ArticleCard({ article, className }: { article: PressArticle; className: string }) {
    const multi = article.sources.length > 1;
    const primary = article.sources[0];

    if (!multi) {
        return (
            <a
                href={primary.url}
                target={primary.url.startsWith("http") ? "_blank" : undefined}
                rel={primary.url.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`group flex flex-col gap-3 p-5 sm:p-10 transition-colors hover:bg-white/[0.02] ${className}`}
            >
                <div className="flex items-center gap-3">
                    <span
                        className="text-[11px] font-mono font-medium uppercase tracking-wider"
                        style={{ color: primary.color }}
                    >
                        {primary.name}
                    </span>
                    <span className="text-[11px] font-mono text-grey/40">{article.date}</span>
                </div>
                <h5 className="text-base md:text-lg text-white/90 group-hover:text-white transition-colors leading-snug">
                    {article.title}
                </h5>
                <span className="inline-flex items-center gap-1.5 text-sm text-grey/50 group-hover:text-grey/80 transition-colors mt-auto w-fit font-mono">
                    Read article
                    <ArrowIcon />
                </span>
            </a>
        );
    }

    return (
        <div className={`group/flip relative ${className}`} style={{ perspective: "900px" }}>
            <div
                className="relative w-full transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/flip:[transform:rotateY(180deg)]"
                style={{ transformStyle: "preserve-3d" }}
            >
                <div
                    className="flex flex-col gap-3 p-5 sm:p-10"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    <div className="flex items-center gap-2 flex-wrap">
                        {article.sources.map((s, si) => (
                            <span
                                key={s.url}
                                className="text-[11px] font-mono font-medium uppercase tracking-wider"
                                style={{ color: s.color }}
                            >
                                {s.name}{si < article.sources.length - 1 ? <span className="text-grey/30 ml-2">·</span> : null}
                            </span>
                        ))}
                        <span className="text-[11px] font-mono text-grey/40 ml-1">{article.date}</span>
                    </div>
                    <h5 className="text-base md:text-lg text-white/90 leading-snug">
                        {article.title}
                    </h5>
                    <span className="inline-flex items-center gap-1.5 text-sm text-grey/50 mt-auto w-fit font-mono">
                        {article.sources.length} sources · hover to see
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-40">
                            <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </span>
                </div>

                <div
                    className="absolute inset-0 flex items-center justify-center bg-[var(--color-primary)]"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                    <div className="flex w-full h-full">
                        {article.sources.map((s, si) => (
                            <a
                                key={s.url}
                                href={s.url}
                                target={s.url.startsWith("http") ? "_blank" : undefined}
                                rel={s.url.startsWith("http") ? "noopener noreferrer" : undefined}
                                className="group/link flex flex-1 flex-col items-center justify-center gap-2 hover:bg-white/[0.04] transition-colors"
                                style={{
                                    borderRight: si < article.sources.length - 1 ? `1px solid ${s.color}20` : undefined,
                                }}
                            >
                                <span
                                    className="text-xs font-mono font-medium text-center"
                                    style={{ color: s.color }}
                                >
                                    {s.name}
                                </span>
                                <span className="opacity-30 group-hover/link:opacity-70 transition-opacity">
                                    <ArrowIcon />
                                </span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function ArrowIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-40 group-hover:opacity-70 transition-opacity">
            <path d="M5.5 3.5H12.5V10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12.5 3.5L3.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/* ─── Full-screen press dialog ─── */
function PressDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus search on open
    useEffect(() => {
        let focusTimer: number | undefined;
        if (open) {
            focusTimer = window.setTimeout(() => inputRef.current?.focus(), 100);
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            if (focusTimer !== undefined) window.clearTimeout(focusTimer);
            document.body.style.overflow = "";
        };
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    const filtered = ARTICLES.filter((a) => {
        if (!query.trim()) return true;
        const q = query.toLowerCase();
        return (
            a.title.toLowerCase().includes(q) ||
            a.date.toLowerCase().includes(q) ||
            a.sources.some((s) => s.name.toLowerCase().includes(q))
        );
    });

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-start justify-center"
        >
            {/* Backdrop */}
            <button
                type="button"
                aria-label="Close press dialog"
                onClick={onClose}
                className="absolute inset-0 bg-primary/80 backdrop-blur-md animate-[fadeIn_200ms_ease-out]"
            />

            {/* Panel */}
            <div
                className="relative w-full max-w-3xl mx-4 mt-[8vh] mb-8 max-h-[84vh] flex flex-col border border-nickel overflow-hidden animate-[dialogSlideIn_250ms_ease-out] bg-primary"
            >
                {/* Search header */}
                <div className="flex items-center gap-3 px-5 sm:px-10 py-5 border-b border-nickel">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-grey shrink-0">
                        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M16 16L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search press coverage"
                        placeholder="Search articles, sources, dates..."
                        className="flex-1 bg-transparent text-white text-sm font-mono placeholder:text-grey/50 outline-none"
                    />
                    <span className="text-[11px] font-mono text-grey shrink-0 hidden sm:block">
                        {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                    </span>
                    <button
                        onClick={onClose}
                        className="shrink-0 px-2 py-1 border border-nickel text-grey text-xs font-mono hover:text-white hover:border-grey transition-colors"
                    >
                        Esc
                    </button>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-grey/30">
                                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M16 16L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            <p className="text-sm font-mono text-grey">No articles match "{query}"</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-nickel">
                            {filtered.map((article) => {
                                const primary = article.sources[0];
                                return (
                                    <div key={`${article.date}-${article.title}`} className="group flex flex-col gap-2.5 px-5 sm:px-10 py-5 hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {article.sources.map((s) => (
                                                <a
                                                    key={s.url}
                                                    href={s.url}
                                                    target={s.url.startsWith("http") ? "_blank" : undefined}
                                                    rel={s.url.startsWith("http") ? "noopener noreferrer" : undefined}
                                                    className="text-[11px] font-mono font-medium uppercase tracking-wider hover:underline underline-offset-2"
                                                    style={{ color: s.color }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {s.name}
                                                </a>
                                            ))}
                                            <span className="text-[11px] font-mono text-grey">{article.date}</span>
                                        </div>
                                        <a
                                            href={primary.url}
                                            target={primary.url.startsWith("http") ? "_blank" : undefined}
                                            rel={primary.url.startsWith("http") ? "noopener noreferrer" : undefined}
                                            className="text-base text-white/90 hover:text-white transition-colors leading-snug"
                                        >
                                            {article.title}
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 sm:px-10 py-4 border-t border-nickel flex items-center justify-between">
                    <span className="text-[11px] font-mono text-grey">
                        {ARTICLES.length} articles total
                    </span>
                    <span className="text-[11px] font-mono text-grey hidden sm:block">
                        Click source names to visit · Esc to close
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function PressSection() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const closeDialog = useCallback(() => setDialogOpen(false), []);

    const visible = ARTICLES.slice(0, VISIBLE_COUNT);
    const hasMore = ARTICLES.length > VISIBLE_COUNT;

    return (
        <section
            id="press"
            className="wrapper wrapper--ticks border-t border-nickel"
        >
            {/* Header */}
            <div className="px-5 sm:px-10 py-14 sm:py-20 flex flex-col gap-3 border-b border-nickel">
                <div className="terminal-prompt mb-2">
                    <span>sort ./coverage --by latest --limit 6</span>
                    <span className="terminal-cursor" />
                </div>
                <h2 className="text-heading-2 text-white max-w-2xl text-balance">
                    {PRESS.meta.title}
                </h2>
                <p className="max-w-lg text-white/70 text-balance text-base md:text-lg">
                    {PRESS.meta.subtitle}
                </p>
            </div>

            {/* Articles grid — limited to VISIBLE_COUNT */}
            <div className="relative">
                <div className="grid md:grid-cols-2" style={{ display: "grid" }}>
                    {visible.map((article, i) => {
                        const isLastRow = i >= visible.length - (visible.length % 2 === 0 ? 2 : 1);
                        const isLeftCol = i % 2 === 0;
                        const borderCls = `${!isLastRow ? "border-b border-nickel" : ""} ${isLeftCol ? "md:border-r border-nickel" : ""}`;

                        return (
                            <ArticleCard
                                key={`${article.date}-${article.title}`}
                                article={article}
                                className={borderCls}
                            />
                        );
                    })}
                </div>

                {/* Fade overlay + "View all" */}
                {hasMore && (
                    <div className="relative border-t border-nickel/30">
                        {/* Top fade that bleeds over last row */}
                        <div
                            className="absolute -top-24 left-0 right-0 h-24 pointer-events-none z-10"
                            style={{ background: "linear-gradient(to top, var(--color-primary) 0%, transparent 100%)" }}
                        />

                        <div className="relative z-20 flex items-center justify-center py-8 sm:py-10">
                            <button
                                onClick={() => setDialogOpen(true)}
                                className="group flex items-center gap-3 px-6 py-3 rounded-lg border border-nickel/40 hover:border-nickel/70 bg-white/[0.02] hover:bg-white/[0.04] transition-[background-color,border-color] cursor-pointer"
                            >
                                <span className="text-sm font-mono text-grey/70 group-hover:text-white transition-colors">
                                    View all {ARTICLES.length} articles
                                </span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-grey/40 group-hover:text-white transition-colors">
                                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M16 16L20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Dialog */}
            <PressDialog open={dialogOpen} onClose={closeDialog} />
        </section>
    );
}
