"use client";

import * as React from "react";
import { useQueryStates, parseAsString } from "nuqs";
import { Plus, Search, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { EditorialSplit } from "@/components/marketing/editorial-split";
import {
  FAQ_CATEGORIES,
  FAQ_ITEMS,
  type FaqCategory,
  type FaqCategoryId,
  type FaqItem,
} from "./faq-data";

/**
 * FAQ-Explorer — Suchfeld, Kategorie-Chips und Accordion-Liste.
 *
 * State via nuqs (URL-Sync):
 *   ?q=kunststoff     →  Suche
 *   ?kategorie=versand →  Kategorie-Filter (fehlt = Alle)
 *
 * Accordion ist native <details>, kein JS-Toggle — so schnell, so
 * leichtgewichtig, so accessibility-by-default.
 */

// Highlight-Helper — splittet Text in Teile und markiert Matches
function highlight(text: string, query: string) {
  if (!query) return text;
  const q = query.trim();
  if (q.length < 2) return text;
  const regex = new RegExp(
    `(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi",
  );
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        className="bg-brand-100 px-0.5 text-brand-900 rounded-[2px]"
      >
        {part}
      </mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );
}

function matchesQuery(item: FaqItem, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase().trim();
  if (q.length < 2) return true;
  if (item.question.toLowerCase().includes(q)) return true;
  if (item.answer.some((p) => p.toLowerCase().includes(q))) return true;
  if (item.keywords?.some((k) => k.toLowerCase().includes(q))) return true;
  return false;
}

export function FaqExplorer() {
  const [{ q, kategorie }, setParams] = useQueryStates(
    {
      q: parseAsString.withDefault(""),
      kategorie: parseAsString.withDefault(""),
    },
    { history: "replace", shallow: true },
  );

  // Lokaler Eingabestate für sanftes Tippen (URL wird gedebounced gesetzt)
  const [inputValue, setInputValue] = React.useState(q);
  React.useEffect(() => {
    setInputValue(q);
  }, [q]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== q) {
        setParams({ q: inputValue || null });
      }
    }, 180);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const activeCategory = (kategorie as FaqCategoryId) || "";
  const setActiveCategory = (cat: "" | FaqCategoryId) => {
    setParams({ kategorie: cat || null });
  };

  // Filter-Pipeline
  const filtered = React.useMemo(() => {
    return FAQ_ITEMS.filter((it) => {
      if (activeCategory && it.category !== activeCategory) return false;
      if (!matchesQuery(it, inputValue)) return false;
      return true;
    });
  }, [activeCategory, inputValue]);

  const isSearching = inputValue.trim().length >= 2;
  const hasFilter = isSearching || !!activeCategory;
  const resetAll = () => {
    setInputValue("");
    setParams({ q: null, kategorie: null });
  };

  // Gruppiert: bei "Alle" und ohne Suche — nach Kategorie sortiert
  const grouped = React.useMemo(() => {
    const map = new Map<FaqCategoryId, FaqItem[]>();
    for (const cat of FAQ_CATEGORIES) map.set(cat.id, []);
    for (const item of filtered) {
      map.get(item.category)?.push(item);
    }
    return map;
  }, [filtered]);

  const showGrouped = !activeCategory && !isSearching;

  return (
    <div>
      {/* ═══════ COMMAND-BAR — Suchfeld + Kategorien ═══════ */}
      <CommandBar
        value={inputValue}
        onChange={setInputValue}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        resultCount={filtered.length}
        hasFilter={hasFilter}
        onReset={resetAll}
      />

      {/* ═══════ ERGEBNISSE ═══════ */}
      <div className="mt-16 md:mt-24">
        {filtered.length === 0 ? (
          <EmptyState query={inputValue} onReset={resetAll} />
        ) : showGrouped ? (
          // Gruppiert nach Kategorie
          <div className="space-y-20 md:space-y-28">
            {FAQ_CATEGORIES.map((cat) => {
              const items = grouped.get(cat.id) ?? [];
              if (items.length === 0) return null;
              return (
                <CategoryGroup key={cat.id} category={cat} items={items} />
              );
            })}
          </div>
        ) : (
          // Flache Liste — bei Suche oder Kategorie-Filter
          <FlatList items={filtered} highlightQuery={inputValue} />
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMMAND-BAR — prominente Suche + Kategorie-Chips
   ═══════════════════════════════════════════════════════════════ */
function CommandBar({
  value,
  onChange,
  activeCategory,
  onCategoryChange,
  resultCount,
  hasFilter,
  onReset,
}: {
  value: string;
  onChange: (v: string) => void;
  activeCategory: "" | FaqCategoryId;
  onCategoryChange: (c: "" | FaqCategoryId) => void;
  resultCount: number;
  hasFilter: boolean;
  onReset: () => void;
}) {
  return (
    <div className="relative">
      {/* Editorial Suchfeld — gross, mit grosser Glasleiste */}
      <div
        className={cn(
          "group relative flex items-center gap-4",
          "border-y border-black-200",
          "py-5 md:py-7",
          "transition-colors duration-200",
          "focus-within:border-black-950",
        )}
      >
        <Search
          className="size-5 shrink-0 text-black-400 transition-colors duration-200 group-focus-within:text-black-950 md:size-6"
          aria-hidden
        />
        <input
          type="text"
          inputMode="search"
          autoComplete="off"
          spellCheck={false}
          placeholder="Suchen — z. B. Lieferzeit, Montage, U-Wert …"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full bg-transparent",
            "font-heading text-xl md:text-3xl lg:text-4xl",
            "font-light tracking-tight text-black-950",
            "placeholder:text-black-300 placeholder:font-light",
            "focus:outline-none",
          )}
          aria-label="FAQ durchsuchen"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-black-400 transition-colors hover:bg-black-100 hover:text-black-950 md:size-11"
            aria-label="Eingabe löschen"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>

      {/* Meta-Row: Treffer + Reset */}
      <div className="mt-5 flex items-center justify-between gap-4 md:mt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-black-500 md:text-xs">
          <span className="tabular-nums text-black-950">
            {resultCount.toString().padStart(2, "0")}
          </span>{" "}
          {resultCount === 1 ? "Frage" : "Fragen"}
          {hasFilter ? " gefiltert" : " insgesamt"}
        </p>

        {hasFilter && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-black-600 transition-colors hover:text-brand-700 md:text-xs"
          >
            <X className="size-3" aria-hidden />
            Filter zurücksetzen
          </button>
        )}
      </div>

      {/* Kategorie-Chips — horizontal scrollbar auf mobile */}
      <div className="mt-6 md:mt-8">
        <div
          className={cn(
            "-mx-[var(--page-padding-inline)] px-[var(--page-padding-inline)]",
            "flex gap-2 overflow-x-auto pb-2",
            "md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0",
            "scrollbar-hide",
          )}
          style={{ scrollbarWidth: "none" }}
          role="tablist"
          aria-label="FAQ-Kategorien"
        >
          <CategoryChip
            active={!activeCategory}
            onClick={() => onCategoryChange("")}
            label="Alle Fragen"
          />
          {FAQ_CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat.id}
              active={activeCategory === cat.id}
              onClick={() => onCategoryChange(cat.id)}
              label={cat.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border px-4 py-2",
        "text-sm font-medium tracking-tight",
        "transition-all duration-150",
        active
          ? "border-black-950 bg-black-950 text-white-100"
          : "border-black-200 bg-white text-black-700 hover:border-black-950 hover:text-black-950",
      )}
    >
      {label}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CATEGORY-GROUP — eine Rubrik mit eigenem Editorial-Header
   ═══════════════════════════════════════════════════════════════ */
function CategoryGroup({
  category,
  items,
}: {
  category: FaqCategory;
  items: FaqItem[];
}) {
  const count = items.length.toString().padStart(2, "0");
  const eyebrow = `${count} ${items.length === 1 ? "Frage" : "Fragen"}`;

  return (
    <section aria-labelledby={`faq-cat-${category.id}`}>
      <EditorialSplit
        eyebrow={eyebrow}
        headline={category.label}
        body={category.tagline}
        headingId={`faq-cat-${category.id}`}
        spacing="compact"
      />
      <AccordionList items={items} />
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FLAT-LIST — einheitliche Liste ohne Gruppen-Header
   (bei Suche oder Kategorie-Filter)
   ═══════════════════════════════════════════════════════════════ */
function FlatList({
  items,
  highlightQuery,
}: {
  items: FaqItem[];
  highlightQuery: string;
}) {
  return <AccordionList items={items} highlightQuery={highlightQuery} />;
}

/* ═══════════════════════════════════════════════════════════════
   ACCORDION-LIST — native <details>, Plus-Icon rotiert zu X,
   Nummerierung in Mono. Gleiche Ästhetik wie Homepage-FAQ.
   ═══════════════════════════════════════════════════════════════ */
function AccordionList({
  items,
  highlightQuery = "",
}: {
  items: FaqItem[];
  highlightQuery?: string;
}) {
  return (
    <div className="divide-y divide-black-200 border-y border-black-200">
      {items.map((item, i) => {
        const categoryMeta = FAQ_CATEGORIES.find((c) => c.id === item.category);
        return (
          <details
            key={item.id}
            className="group scroll-mt-32"
            id={`faq-${item.id}`}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 transition-colors hover:text-brand-700 md:py-7">
              <div className="flex flex-1 items-baseline gap-4 md:gap-5">
                <span className="font-mono text-[11px] tabular-nums text-black-400 md:text-xs">
                  {(i + 1).toString().padStart(2, "0")}
                </span>
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-medium leading-tight tracking-tight text-black-950 transition-colors group-hover:text-brand-700 md:text-xl lg:text-2xl">
                    {highlight(item.question, highlightQuery)}
                  </h3>
                  {highlightQuery && categoryMeta && (
                    <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-black-400">
                      {categoryMeta.label}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-black-300 transition-all group-hover:border-brand-500 group-open:border-brand-500 group-open:bg-brand-500 md:size-10">
                <Plus
                  className="size-4 text-black-700 transition-all duration-300 group-open:rotate-45 group-open:text-white-100"
                  aria-hidden
                />
              </div>
            </summary>
            <div className="pb-7 pl-9 pr-4 md:pl-11 md:pr-16">
              <div className="max-w-3xl space-y-4">
                {item.answer.map((paragraph, pi) => (
                  <p
                    key={pi}
                    className="text-base leading-relaxed text-black-700 md:text-[17px]"
                  >
                    {highlight(paragraph, highlightQuery)}
                  </p>
                ))}
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EMPTY-STATE — editorial, mit Reset + CTA
   ═══════════════════════════════════════════════════════════════ */
function EmptyState({
  query,
  onReset,
}: {
  query: string;
  onReset: () => void;
}) {
  return (
    <div className="border-y border-black-200 py-20 text-center md:py-28">
      <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-brand-600">
        Keine Treffer
      </p>
      <h3 className="mt-6 font-heading text-3xl font-medium leading-tight tracking-tight text-black-950 md:text-4xl lg:text-5xl">
        {query ? (
          <>
            Nichts gefunden zu{" "}
            <span className="italic text-brand-700">
              „{query.trim()}"
            </span>
            .
          </>
        ) : (
          <>In dieser Kategorie steht gerade nichts.</>
        )}
      </h3>
      <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-black-600 md:text-lg">
        Versuch einen anderen Begriff oder stell uns die Frage direkt.
        Wir antworten meist am selben Werktag.
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-black-700 transition-colors hover:text-brand-700"
        >
          <X className="size-3.5" aria-hidden />
          Filter zurücksetzen
        </button>
        <span
          aria-hidden
          className="hidden h-4 w-px bg-black-200 sm:block"
        />
        <Link
          href="/kontakt"
          className="group inline-flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.2em] text-black-950 transition-colors hover:text-brand-700"
        >
          Frage direkt stellen
          <ArrowRight
            className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </div>
  );
}
