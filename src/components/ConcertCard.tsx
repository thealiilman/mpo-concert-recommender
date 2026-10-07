import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarBlank,
  Clock,
  MapPin,
  Ticket,
  ArrowSquareOut,
  User,
  MusicNotes,
  Sparkle
} from "@phosphor-icons/react";
import type { Concert, Composition } from "../types/concert";

interface ConcertCardProps {
  concert: Concert;
  matchedPieces?: Composition[];
  index: number;
}

const CATEGORY_COLORS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  CLASSICAL: {
    bg: "bg-[#D4AF37]/10",
    text: "text-[#D4AF37]",
    border: "border-[#D4AF37]/30"
  },
  POPS: {
    bg: "bg-[#801B2A]/20",
    text: "text-[#FBF8F1]",
    border: "border-[#801B2A]/50"
  },
  MPYO: {
    bg: "bg-purple-950/40",
    text: "text-purple-300",
    border: "border-purple-800/40"
  },
  LOCALS: {
    bg: "bg-amber-950/40",
    text: "text-amber-300",
    border: "border-amber-800/40"
  },
  FAMILY: {
    bg: "bg-emerald-950/40",
    text: "text-emerald-300",
    border: "border-emerald-800/40"
  },
  CHAMBER: {
    bg: "bg-blue-950/40",
    text: "text-blue-300",
    border: "border-blue-800/40"
  },
  SPECIAL: {
    bg: "bg-rose-950/40",
    text: "text-rose-300",
    border: "border-rose-800/40"
  }
};

export const ConcertCard: React.FC<ConcertCardProps> = ({
  concert,
  matchedPieces = [],
  index
}) => {
  const [imgError, setImgError] = useState(false);
  const catStyle =
    CATEGORY_COLORS[concert.category] || CATEGORY_COLORS.CLASSICAL;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
      className="group relative flex flex-col md:flex-row bg-[#15131A] rounded-2xl border border-[#2A2533] hover:border-[#D4AF37]/60 transition-all duration-300 overflow-hidden shadow-xl hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
    >
      {/* Poster Image Container */}
      <div className="relative md:w-72 lg:w-80 shrink-0 bg-[#0C0B0E] overflow-hidden flex items-center justify-center min-h-[220px] md:min-h-full">
        {!imgError && concert.imageUrl ? (
          <img
            src={concert.imageUrl}
            alt={concert.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#1E1B24] to-[#0C0B0E]">
            <MusicNotes
              size={48}
              className="text-[#D4AF37]/40 mb-3"
              weight="thin"
            />
            <span className="font-serif text-sm text-[#948B80] italic">
              Malaysian Philharmonic Orchestra
            </span>
          </div>
        )}

        {/* Gradient overlay on mobile/desktop */}
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-[#15131A]/20 to-[#15131A] pointer-events-none" />

        {/* Category Badge on Image */}
        <div className="absolute top-3 left-3">
          <span
            className={`text-[11px] font-mono tracking-widest uppercase px-2.5 py-1 rounded-md border backdrop-blur-md ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
          >
            {concert.category}
          </span>
        </div>

        {/* Season Tag */}
        <div className="absolute bottom-3 left-3">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0C0B0E]/80 backdrop-blur-sm border border-[#2A2533] text-[#EDE6D6]">
            Season {concert.season}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between">
        <div>
          {/* Header Row: Date & Time */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mb-3 text-xs font-mono text-[#D4AF37]">
            <div className="flex items-center gap-1.5 bg-[#D4AF37]/10 px-2.5 py-1 rounded-lg border border-[#D4AF37]/20">
              <CalendarBlank size={14} weight="bold" />
              <span className="font-semibold tracking-wide">
                {concert.dates.map((d) => d.dateStr).join(" & ")}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[#948B80]">
              <Clock size={14} />
              <span>{concert.dates[0]?.time}</span>
            </div>

            {concert.duration && (
              <span className="text-[11px] text-[#5C554E] hidden sm:inline-block">
                • {concert.duration}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-serif text-[#FBF8F1] group-hover:text-[#D4AF37] transition-colors leading-snug mb-3">
            {concert.title}
          </h3>

          {/* Artists: Conductor & Soloists */}
          {(concert.conductor ||
            (concert.soloists && concert.soloists.length > 0)) && (
            <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
              {concert.conductor && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1E1B24] border border-[#2A2533] text-[#EDE6D6]">
                  <User size={13} className="text-[#D4AF37]" />
                  <span>
                    <strong className="text-[#948B80] font-normal">
                      Conductor:
                    </strong>{" "}
                    {concert.conductor}
                  </span>
                </div>
              )}
              {concert.soloists?.map((soloist) => (
                <div
                  key={soloist}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1E1B24] border border-[#2A2533] text-[#EDE6D6]"
                >
                  <Sparkle size={13} className="text-[#D4AF37]" weight="fill" />
                  <span>{soloist}</span>
                </div>
              ))}
            </div>
          )}

          {/* Matched / Performed Compositions Box */}
          <div className="my-4 p-3.5 rounded-xl bg-[#0C0B0E]/60 border border-[#2A2533] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#948B80]">
              <span className="flex items-center gap-1.5">
                <MusicNotes size={13} className="text-[#D4AF37]" />
                Program Repertoire ({concert.compositions.length} works)
              </span>
            </div>

            <div className="space-y-1.5">
              {concert.compositions.map((piece, pIdx) => {
                const isDirectMatch = matchedPieces.some(
                  (m) =>
                    m.title.toLowerCase() === piece.title.toLowerCase() ||
                    m.composer.toLowerCase() === piece.composer.toLowerCase()
                );

                return (
                  <div
                    key={pIdx}
                    className={`flex items-start justify-between gap-2 p-2 rounded-lg text-xs transition-colors ${
                      isDirectMatch
                        ? "bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#FBF8F1]"
                        : "bg-[#15131A]/40 text-[#EDE6D6]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[#D4AF37] font-semibold tracking-wide">
                        {piece.composer}
                      </span>
                      <span className="text-[#5C554E]">•</span>
                      <span
                        className={
                          isDirectMatch ? "font-medium" : "text-[#EDE6D6]"
                        }
                      >
                        {piece.title}
                      </span>
                    </div>
                    {isDirectMatch && (
                      <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded bg-[#D4AF37]/30 text-[#D4AF37] font-semibold">
                        Matched Work
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-[#948B80] line-clamp-2 leading-relaxed mb-4">
            {concert.description}
          </p>
        </div>

        {/* Card Footer: Venue and Action Buttons */}
        <div className="pt-4 border-t border-[#2A2533] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#948B80]">
            <MapPin size={14} className="text-[#D4AF37]" />
            <span>{concert.venue || "Dewan Filharmonik PETRONAS, KLCC"}</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={concert.mpoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg border border-[#362F42] hover:border-[#D4AF37] text-xs text-[#EDE6D6] hover:text-[#D4AF37] transition-colors flex items-center gap-1 bg-[#1E1B24]"
            >
              <span>MPO Details</span>
              <ArrowSquareOut size={12} />
            </a>

            {concert.ticketUrl && (
              <a
                href={concert.ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#801B2A] to-[#A52538] hover:from-[#952032] hover:to-[#B82B40] text-xs font-medium text-[#FBF8F1] transition-all shadow flex items-center gap-1.5 active:scale-95"
              >
                <Ticket size={14} weight="bold" />
                <span>Book at DFP</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
};
