import { useState, useCallback, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "./components/Header";
import { HeroSearch } from "./components/HeroSearch";
import { ConcertCard } from "./components/ConcertCard";
import { EmptyState } from "./components/EmptyState";
import { AttributionFooter } from "./components/AttributionFooter";
import { searchConcerts, CONCERT_DATABASE } from "./lib/search";
import type { SearchResult } from "./types/concert";
import {
  Sparkle,
  SlidersHorizontal,
  ArrowLeft,
  CalendarBlank
} from "@phosphor-icons/react";

export default function App() {
  const [query, setQuery] = useState<string>("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [, startTransition] = useTransition();

  const handleSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setQuery(trimmed);
    setIsLoading(true);

    try {
      // 1. Instant local search check
      const localResult = searchConcerts(trimmed);

      // 2. If it's a direct exact match with multiple matches, show immediately
      if (localResult.hasMatches && trimmed.split(" ").length <= 2) {
        setSearchResult(localResult);
        setIsLoading(false);
        return;
      }

      // 3. Query LLM endpoint for natural language resolution or if local search had no hits
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed })
      });

      if (response.ok) {
        const data = (await response.json()) as SearchResult;
        startTransition(() => {
          setSearchResult(data);
        });
      } else {
        // Fallback to local result if API is unreachable
        startTransition(() => {
          setSearchResult(localResult);
        });
      }
    } catch (err) {
      console.warn("API search failed, using local search fallback:", err);
      const localResult = searchConcerts(trimmed);
      startTransition(() => {
        setSearchResult(localResult);
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setQuery("");
    setSearchResult(null);
    setActiveCategory("ALL");
  }, []);

  const isInitialState = !searchResult && !isLoading;
  const hasResults =
    searchResult && searchResult.hasMatches && searchResult.concerts.length > 0;
  const isEmptyState = searchResult && !searchResult.hasMatches;

  // Filter concerts by category if selected
  const displayedConcerts = (searchResult?.concerts || []).filter((c) => {
    if (activeCategory === "ALL") return true;
    return c.category === activeCategory;
  });

  const availableCategories = [
    "ALL",
    ...Array.from(
      new Set((searchResult?.concerts || []).map((c) => c.category))
    )
  ];

  return (
    <div className="min-h-screen bg-concert-gradient flex flex-col justify-between text-[#EDE6D6]">
      <div>
        {/* Navigation Header */}
        <Header onReset={handleReset} isCompact={!isInitialState} />

        {/* Compact Search Bar in Results/Empty Mode */}
        {!isInitialState && (
          <div className="border-b border-[#2A2533] bg-[#15131A]/90 backdrop-blur-md sticky top-[73px] z-30 shadow-md">
            <HeroSearch
              onSearch={handleSearch}
              isLoading={isLoading}
              currentQuery={query}
              isCompact={true}
            />
          </div>
        )}

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <AnimatePresence mode="wait">
            {/* INITIAL STATE */}
            {isInitialState && (
              <motion.div
                key="initial"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
              >
                <HeroSearch
                  onSearch={handleSearch}
                  isLoading={isLoading}
                  currentQuery={query}
                  isCompact={false}
                />

                {/* Season Highlights Preview */}
                <div className="mt-12 pt-8 border-t border-[#2A2533]/60 max-w-4xl mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CalendarBlank
                        size={16}
                        className="text-[#D4AF37]"
                        weight="bold"
                      />
                      <h3 className="font-serif text-lg text-[#FBF8F1]">
                        Season 2026 At A Glance
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-[#948B80]">
                      {CONCERT_DATABASE.length} Scheduled Programs
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {CONCERT_DATABASE.slice(0, 6).map((c) => (
                      <button
                        key={c.id}
                        onClick={() =>
                          handleSearch(c.compositions[0]?.composer || c.title)
                        }
                        className="text-left p-3.5 rounded-xl border border-[#2A2533] bg-[#15131A]/60 hover:bg-[#1E1B24] hover:border-[#D4AF37]/50 transition-all group"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#D4AF37] mb-1">
                          <span>{c.dates[0]?.dateStr}</span>
                          <span className="uppercase text-[#5C554E]">
                            {c.category}
                          </span>
                        </div>
                        <h4 className="font-serif text-sm text-[#EDE6D6] group-hover:text-[#FBF8F1] line-clamp-1">
                          {c.title}
                        </h4>
                        <p className="text-[11px] text-[#948B80] line-clamp-1 mt-0.5">
                          {c.compositions.map((p) => p.composer).join(", ")}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* RESULTS STATE */}
            {hasResults && searchResult && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Result Top Summary Banner */}
                <div className="p-5 rounded-2xl bg-[#15131A] border border-[#2A2533] shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono text-[#D4AF37] uppercase tracking-wider mb-1">
                        <Sparkle size={14} weight="fill" />
                        <span>Repertoire Query Resolved</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-serif text-[#FBF8F1]">
                        {searchResult.resolvedComposer || query}
                      </h2>
                      {searchResult.aiCommentary && (
                        <p className="text-xs sm:text-sm text-[#948B80] italic mt-1 font-light">
                          "{searchResult.aiCommentary}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-2xl font-serif font-bold text-[#D4AF37]">
                          {searchResult.totalConcerts}
                        </span>
                        <span className="text-xs text-[#948B80] block font-mono">
                          {searchResult.totalConcerts === 1
                            ? "Concert Found"
                            : "Concerts Found"}
                        </span>
                      </div>
                      <button
                        onClick={handleReset}
                        className="px-3 py-1.5 rounded-lg border border-[#362F42] hover:border-[#D4AF37] bg-[#1E1B24] text-xs text-[#EDE6D6] hover:text-[#D4AF37] transition-all flex items-center gap-1"
                      >
                        <ArrowLeft size={13} />
                        <span>New Search</span>
                      </button>
                    </div>
                  </div>

                  {/* Category Filter Tabs (if multiple categories present) */}
                  {availableCategories.length > 2 && (
                    <div className="mt-4 pt-4 border-t border-[#2A2533] flex items-center gap-2 overflow-x-auto">
                      <span className="text-xs font-mono text-[#5C554E] flex items-center gap-1 mr-1">
                        <SlidersHorizontal size={12} />
                        Filter:
                      </span>
                      {availableCategories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`px-3 py-1 rounded-full text-xs font-mono transition-all ${
                            activeCategory === cat
                              ? "bg-[#D4AF37] text-[#0C0B0E] font-semibold shadow"
                              : "border border-[#2A2533] bg-[#1E1B24] text-[#948B80] hover:text-[#EDE6D6]"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Concert Cards List (Sorted Chronologically) */}
                <div className="space-y-6">
                  {displayedConcerts.map((concert, idx) => (
                    <ConcertCard
                      key={concert.id}
                      concert={concert}
                      matchedPieces={
                        searchResult.matchedCompositionsByConcertId[
                          concert.id
                        ] || []
                      }
                      index={idx}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* EMPTY STATE */}
            {isEmptyState && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <EmptyState
                  query={query}
                  resolvedComposer={searchResult?.resolvedComposer}
                  onSelectComposer={handleSearch}
                  onReset={handleReset}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Attribution & Homage Footer */}
      <AttributionFooter />
    </div>
  );
}
