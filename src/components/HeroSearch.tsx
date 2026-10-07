import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  MagnifyingGlass,
  Sparkle,
  X,
  ArrowRight,
  SpinnerGap
} from "@phosphor-icons/react";
import { FEATURED_COMPOSERS } from "../lib/search";

interface HeroSearchProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  currentQuery?: string;
  isCompact?: boolean;
}

const NL_EXAMPLES = [
  "composer who wrote Swan Lake",
  "that deaf German composer",
  "who wrote Bohemian Rhapsody",
  "Ghibli anime music creator",
  "Star Wars film score master",
  "Four Seasons Italian baroque"
];

export const HeroSearch: React.FC<HeroSearchProps> = ({
  onSearch,
  isLoading = false,
  currentQuery = "",
  isCompact = false
}) => {
  const [inputVal, setInputVal] = useState(currentQuery);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputVal(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % NL_EXAMPLES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onSearch(inputVal.trim());
    }
  };

  const handleChipClick = (name: string) => {
    setInputVal(name);
    onSearch(name);
  };

  if (isCompact) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-3">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <div className="absolute left-4 text-[#D4AF37] pointer-events-none">
            {isLoading ? (
              <SpinnerGap size={18} className="animate-spin text-[#D4AF37]" />
            ) : (
              <MagnifyingGlass size={18} weight="bold" />
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={`Search composer or query (e.g., "${NL_EXAMPLES[placeholderIndex]}")...`}
            className="w-full pl-11 pr-24 py-2.5 rounded-full bg-[#15131A] border border-[#2A2533] focus:border-[#D4AF37] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 text-[#EDE6D6] placeholder-[#5C554E] text-sm transition-all shadow-inner"
          />
          {inputVal && (
            <button
              type="button"
              onClick={() => {
                setInputVal("");
                inputRef.current?.focus();
              }}
              className="absolute right-12 text-[#948B80] hover:text-[#EDE6D6] p-1 transition-colors"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !inputVal.trim()}
            className="absolute right-1.5 px-3 py-1.5 rounded-full bg-[#801B2A] hover:bg-[#A52538] disabled:opacity-40 disabled:hover:bg-[#801B2A] text-[#FBF8F1] text-xs font-medium transition-all flex items-center gap-1"
          >
            <span>Search</span>
            <ArrowRight size={12} weight="bold" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-3xl mx-auto text-center px-4 py-8 sm:py-12"
    >
      {/* Attendee Statement Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#15131A]/80 backdrop-blur-sm text-xs font-mono text-[#D4AF37] mb-6 shadow-[0_0_20px_rgba(212,175,55,0.08)]">
        <Sparkle size={13} weight="fill" />
        <span>Malaysian Philharmonic Orchestra Repertoire Finder</span>
      </div>

      {/* Hero Headline with Bohemian Serif */}
      <h2 className="text-3xl sm:text-5xl font-serif font-normal tracking-tight text-[#FBF8F1] mb-4 leading-tight">
        Seek Your{" "}
        <span className="italic font-normal text-gold-shimmer">
          Favourite Composer
        </span>
      </h2>

      <p className="text-sm sm:text-base text-[#948B80] max-w-xl mx-auto mb-8 font-light leading-relaxed">
        Enter a composer’s name, their piece, or describe who you’re looking
        for. We will reveal every upcoming concert and composition scheduled at
        Dewan Filharmonik PETRONAS.
      </p>

      {/* Search Input Box */}
      <form
        onSubmit={handleSubmit}
        className="relative max-w-2xl mx-auto group mb-6"
      >
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#D4AF37]/30 via-[#801B2A]/20 to-[#D4AF37]/30 opacity-70 blur-md group-hover:opacity-100 group-focus-within:opacity-100 transition duration-500" />
        <div className="relative flex items-center bg-[#15131A] rounded-2xl border border-[#2A2533] group-focus-within:border-[#D4AF37] shadow-2xl transition-all">
          <div className="pl-5 text-[#D4AF37]">
            {isLoading ? (
              <SpinnerGap size={22} className="animate-spin text-[#D4AF37]" />
            ) : (
              <MagnifyingGlass size={22} weight="bold" />
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={`e.g. Beethoven, or "${NL_EXAMPLES[placeholderIndex]}"`}
            className="w-full px-4 py-4 sm:py-5 bg-transparent text-[#EDE6D6] placeholder-[#5C554E] text-base sm:text-lg focus:outline-none font-sans font-normal"
          />
          {inputVal && (
            <button
              type="button"
              onClick={() => {
                setInputVal("");
                inputRef.current?.focus();
              }}
              className="text-[#948B80] hover:text-[#EDE6D6] p-2 mr-1 transition-colors"
              title="Clear search"
            >
              <X size={18} />
            </button>
          )}
          <div className="pr-3">
            <button
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#801B2A] to-[#A52538] hover:from-[#952032] hover:to-[#B82B40] text-[#FBF8F1] text-sm font-medium transition-all shadow-md active:scale-95 disabled:opacity-40 flex items-center gap-1.5"
            >
              <span>Explore</span>
              <ArrowRight size={14} weight="bold" />
            </button>
          </div>
        </div>
      </form>

      {/* Natural Language Prompt Hints */}
      <div className="flex items-center justify-center gap-1.5 text-xs text-[#948B80] mb-6">
        <Sparkle size={12} className="text-[#D4AF37]" />
        <span>AI-Powered Natural Query Enabled:</span>
        <button
          type="button"
          onClick={() => {
            const example = NL_EXAMPLES[placeholderIndex];
            setInputVal(example);
            onSearch(example);
          }}
          className="underline hover:text-[#D4AF37] transition-colors text-left truncate max-w-xs sm:max-w-md font-mono text-[11px]"
        >
          "{NL_EXAMPLES[placeholderIndex]}"
        </button>
      </div>

      {/* Suggested Composer Chips */}
      <div className="pt-2">
        <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#5C554E] mb-3">
          Popular In Repertoire
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto">
          {FEATURED_COMPOSERS.map((comp) => (
            <button
              key={comp.name}
              type="button"
              onClick={() => handleChipClick(comp.name)}
              className="px-3.5 py-1.5 rounded-full border border-[#2A2533] bg-[#15131A]/60 hover:bg-[#27232F] hover:border-[#D4AF37]/60 text-xs text-[#EDE6D6] hover:text-[#FBF8F1] transition-all flex items-center gap-1.5 active:scale-95"
            >
              <span>{comp.label}</span>
              <span className="text-[10px] font-mono text-[#5C554E] border-l border-[#2A2533] pl-1.5">
                {comp.tag}
              </span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
