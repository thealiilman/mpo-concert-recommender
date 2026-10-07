export interface Composition {
  composer: string;
  composerNormalized: string;
  title: string;
  movementOrSubtitle?: string;
}

export interface ConcertDate {
  dateStr: string;
  isoDate: string; // YYYY-MM-DD for sorting
  time: string;
}

export interface Concert {
  id: string;
  title: string;
  season: number;
  dates: ConcertDate[];
  category:
    | "CLASSICAL"
    | "POPS"
    | "MPYO"
    | "CHAMBER"
    | "FAMILY"
    | "LOCALS"
    | "SPECIAL";
  conductor?: string;
  soloists?: string[];
  description: string;
  compositions: Composition[];
  imageUrl: string;
  ticketUrl?: string;
  mpoUrl: string;
  duration?: string;
  venue?: string;
}

export interface AIInterpretation {
  resolvedComposer: string;
  identifiedReason: string;
  confidence: "high" | "medium" | "low";
}

export interface SearchResult {
  query: string;
  resolvedComposer?: string;
  aiCommentary?: string;
  concerts: Concert[];
  matchedCompositionsByConcertId: Record<string, Composition[]>;
  totalConcerts: number;
  hasMatches: boolean;
}
