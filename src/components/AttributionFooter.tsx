import { Heart, Buildings } from "@phosphor-icons/react";

export const AttributionFooter: React.FC = () => {
  return (
    <footer className="w-full mt-20 border-t border-[#2A2533] bg-[#0C0B0E]/80 py-10 px-4 text-xs font-light text-[#948B80]">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div className="space-y-1.5">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-[#D4AF37] font-medium font-serif text-sm">
            <Buildings size={16} />
            <span>Dewan Filharmonik PETRONAS, Kuala Lumpur</span>
          </div>
          <p className="max-w-md text-[#5C554E] leading-relaxed">
            Data sourced directly from Malaysian Philharmonic Orchestra official
            season programming. This application is an independent community
            project by a dedicated MPO regular attendee.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1 text-[#EDE6D6]">
            <span>Crafted with</span>
            <Heart size={13} className="text-[#801B2A]" weight="fill" />
            <span>for Malaysian classical enthusiasts</span>
          </div>

          <a
            href="https://www.mpo.com.my"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#D4AF37] hover:underline"
          >
            Visit mpo.com.my
          </a>
        </div>
      </div>
    </footer>
  );
};
