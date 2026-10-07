import { Sparkle, MusicNotesSimple } from "@phosphor-icons/react";

interface HeaderProps {
  onReset?: () => void;
  isCompact?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onReset, isCompact }) => {
  return (
    <header
      className={`w-full transition-all duration-300 ${isCompact ? "py-4 border-b border-[#2A2533] bg-[#0C0B0E]/90 backdrop-blur-md sticky top-0 z-40" : "py-6"}`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <button
          onClick={onReset}
          className="flex items-center gap-3 group text-left transition-transform active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-full border border-[#D4AF37]/40 bg-[#15131A] flex items-center justify-center text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)] group-hover:border-[#D4AF37] transition-colors">
            <MusicNotesSimple size={20} weight="fill" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs tracking-[0.25em] uppercase text-[#D4AF37] font-medium">
                Dewan Filharmonik PETRONAS
              </span>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-[#D4AF37]/50" />
              <span className="hidden sm:inline-block text-[11px] font-mono text-[#948B80]">
                Season 2026
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-serif tracking-wide text-[#FBF8F1] group-hover:text-[#D4AF37] transition-colors">
              MPO Repertoire
            </h1>
          </div>
        </button>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#2A2533] bg-[#15131A] text-xs text-[#948B80]">
            <Sparkle size={13} className="text-[#D4AF37]" weight="fill" />
            <span>Curated by a regular attendee</span>
          </div>

          <a
            href="https://www.mpo.com.my"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono px-3 py-1.5 rounded-lg border border-[#362F42] hover:border-[#D4AF37] text-[#EDE6D6] hover:text-[#D4AF37] transition-colors flex items-center gap-1.5 bg-[#15131A]/60"
          >
            <span>Official MPO</span>
            <span className="text-[10px]">↗</span>
          </a>
        </div>
      </div>
    </header>
  );
};
