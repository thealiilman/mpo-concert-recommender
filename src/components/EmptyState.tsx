import React from "react";
import { motion } from "framer-motion";
import { MaskSad, Sparkle, ArrowClockwise } from "@phosphor-icons/react";
import { FEATURED_COMPOSERS } from "../lib/search";

interface EmptyStateProps {
  query: string;
  resolvedComposer?: string;
  onSelectComposer: (name: string) => void;
  onReset: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  query,
  resolvedComposer,
  onSelectComposer,
  onReset
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="max-w-2xl mx-auto my-12 p-8 sm:p-12 text-center rounded-3xl bg-[#15131A] border border-[#2A2533] shadow-2xl relative overflow-hidden"
    >
      {/* Decorative background glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#801B2A]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Dramatic Icon */}
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#0C0B0E] border border-[#801B2A]/40 flex items-center justify-center text-[#A52538] shadow-inner">
        <MaskSad size={36} weight="duotone" />
      </div>

      {/* Bohemian Playful Headline */}
      <h3 className="text-2xl sm:text-4xl font-serif text-[#FBF8F1] mb-3">
        “You’ve got no taste!”
      </h3>

      <p className="text-sm sm:text-base text-[#948B80] font-light max-w-lg mx-auto mb-6 leading-relaxed">
        {resolvedComposer ? (
          <>
            We recognized your search for{" "}
            <strong className="text-[#D4AF37] font-medium">
              {resolvedComposer}
            </strong>{" "}
            (from <em>"{query}"</em>), but alas, our maestros have not
            programmed their works for the current season.
          </>
        ) : (
          <>
            Or perhaps the Malaysian Philharmonic Orchestra simply hasn’t
            programmed{" "}
            <strong className="text-[#EDE6D6] font-medium">"{query}"</strong>{" "}
            this season. History awaits their revival!
          </>
        )}
      </p>

      {/* Reset button */}
      <div className="mb-8">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#362F42] hover:border-[#D4AF37] bg-[#1E1B24] text-xs font-mono text-[#EDE6D6] hover:text-[#D4AF37] transition-all"
        >
          <ArrowClockwise size={13} />
          <span>Reset Search</span>
        </button>
      </div>

      {/* Alternative Suggestions */}
      <div className="pt-6 border-t border-[#2A2533]">
        <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-[#D4AF37] uppercase tracking-wider mb-3">
          <Sparkle size={12} weight="fill" />
          <span>Try Discovering Scheduled Masters</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {FEATURED_COMPOSERS.slice(0, 6).map((comp) => (
            <button
              key={comp.name}
              type="button"
              onClick={() => onSelectComposer(comp.name)}
              className="px-3.5 py-1.5 rounded-full border border-[#2A2533] bg-[#0C0B0E] hover:border-[#D4AF37] text-xs text-[#EDE6D6] hover:text-[#D4AF37] transition-all active:scale-95"
            >
              {comp.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
