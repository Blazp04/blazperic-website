import pressData from "../../db/press.json";

export interface PressSource {
    name: string;
    url: string;
    color: string;
}

export interface PressArticle {
    title: string;
    date: string;
    sources: PressSource[];
}

interface PressDb {
    meta: {
        title: string;
        subtitle: string;
    };
    articles: PressArticle[];
}

function parseArticleDate(date: string): number {
    const value = date.trim();
    const monthMap: Record<string, number> = {
        jan: 0,
        feb: 1,
        mar: 2,
        apr: 3,
        may: 4,
        jun: 5,
        jul: 6,
        aug: 7,
        sep: 8,
        oct: 9,
        nov: 10,
        dec: 11,
    };

    const parts = value.toLowerCase().split(/\s+/);
    if (parts.length === 2 && monthMap[parts[0]] !== undefined) {
        const year = Number(parts[1]);
        if (!Number.isNaN(year)) return new Date(year, monthMap[parts[0]], 1).getTime();
    }

    const yearOnly = Number(value);
    if (!Number.isNaN(yearOnly)) return new Date(yearOnly, 0, 1).getTime();

    return 0;
}

export const PRESS = pressData as PressDb;
export const PRESS_ARTICLES = [...PRESS.articles].sort(
    (a, b) => parseArticleDate(b.date) - parseArticleDate(a.date),
);
