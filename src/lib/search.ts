import type { Concert, Composition, SearchResult } from "../types/concert";
import rawConcerts from "../data/concerts.json";

export const CONCERT_DATABASE: Concert[] = rawConcerts as Concert[];

/**
 * Common composer aliases and piece mappings for instant matching.
 */
const KNOWN_PIECE_TO_COMPOSER: Record<string, string> = {
  "swan lake": "Pyotr Ilyich Tchaikovsky",
  pathetique: "Pyotr Ilyich Tchaikovsky",
  rococo: "Pyotr Ilyich Tchaikovsky",
  emperor: "Ludwig van Beethoven",
  "emperor concerto": "Ludwig van Beethoven",
  "triple concerto": "Ludwig van Beethoven",
  "magic flute": "Wolfgang Amadeus Mozart",
  "eine kleine nachtmusik": "Wolfgang Amadeus Mozart",
  requiem: "Wolfgang Amadeus Mozart",
  "four seasons": "Antonio Vivaldi",
  "the four seasons": "Antonio Vivaldi",
  "la notte": "Antonio Vivaldi",
  "star wars": "John Williams",
  "harry potter": "John Williams",
  "hedwig's theme": "John Williams",
  "home alone": "John Williams",
  totoro: "Joe Hisaishi",
  "spirited away": "Joe Hisaishi",
  "howl's moving castle": "Joe Hisaishi",
  kiki: "Joe Hisaishi",
  ghibli: "Joe Hisaishi",
  "bohemian rhapsody": "Queen / Freddie Mercury",
  "la traviata": "Giuseppe Verdi",
  rigoletto: "Giuseppe Verdi",
  "la donna e mobile": "Giuseppe Verdi",
  "madu tiga": "Tan Sri P. Ramlee",
  "cantus arcticus": "Einojuhani Rautavaara",
  petrushka: "Igor Stravinsky",
  "attack on titan": "Hiroyuki Sawano & Kohta Yamamoto",
  ethnosphere: "Belle Sisoski",
  caravan: "Duke Ellington",
  czardas: "Vittorio Monti",
  csardas: "Vittorio Monti",
  oblivion: "Ástor Piazzolla",
  "toccata and fugue": "Johann Sebastian Bach",
  inception: "Hans Zimmer",
  "pirates of the caribbean": "Hans Zimmer",
  "military symphony": "Joseph Haydn"
};

export const FEATURED_COMPOSERS = [
  { name: "Ludwig van Beethoven", label: "Beethoven", tag: "Classical" },
  { name: "Wolfgang Amadeus Mozart", label: "Mozart", tag: "Classical" },
  { name: "Pyotr Ilyich Tchaikovsky", label: "Tchaikovsky", tag: "Romantic" },
  { name: "Antonio Vivaldi", label: "Vivaldi", tag: "Baroque" },
  { name: "Giuseppe Verdi", label: "Verdi", tag: "Opera" },
  { name: "Joe Hisaishi", label: "Joe Hisaishi (Ghibli)", tag: "Film" },
  { name: "John Williams", label: "John Williams", tag: "Film" },
  { name: "Queen / Freddie Mercury", label: "Queen", tag: "Pops" },
  { name: "Belle Sisoski", label: "Belle Sisoski", tag: "Contemporary" },
  { name: "Tan Sri P. Ramlee", label: "P. Ramlee", tag: "Heritage" }
];

export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents (e.g. Dvořák -> Dvorak)
    .replace(/[^\w\s]/g, " ") // remove punctuation
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks if a search query matches a composer or piece directly.
 */
export function matchComposerDirect(
  concert: Concert,
  query: string
): { isMatch: boolean; matchedPieces: Composition[] } {
  const normQuery = normalizeString(query);
  if (!normQuery) {
    return { isMatch: false, matchedPieces: [] };
  }

  // Check known piece mapping first
  const mappedComposer = Object.entries(KNOWN_PIECE_TO_COMPOSER).find(
    ([piece]) => normQuery.includes(piece)
  )?.[1];

  const targetComposerNorm = mappedComposer
    ? normalizeString(mappedComposer)
    : null;

  const matchedPieces: Composition[] = [];

  for (const comp of concert.compositions) {
    const compNorm = normalizeString(comp.composer);
    const titleNorm = normalizeString(comp.title);

    const isComposerMatch =
      compNorm.includes(normQuery) ||
      normQuery.includes(compNorm) ||
      (targetComposerNorm !== null && compNorm.includes(targetComposerNorm));

    const isTitleMatch =
      titleNorm.includes(normQuery) ||
      (mappedComposer !== null && titleNorm.includes(normQuery));

    // Also match individual word tokens (e.g. "Tchaikovsky" matches "Pyotr Ilyich Tchaikovsky")
    const queryTokens = normQuery.split(" ").filter((t) => t.length > 2);
    const tokenMatch =
      queryTokens.length > 0 &&
      queryTokens.some((token) => compNorm.includes(token));

    if (isComposerMatch || isTitleMatch || tokenMatch) {
      matchedPieces.push(comp);
    }
  }

  return {
    isMatch: matchedPieces.length > 0,
    matchedPieces
  };
}

/**
 * Sorts concerts chronologically closest to a target date.
 */
export function sortConcertsByDate(
  concerts: Concert[],
  referenceDateStr: string = "2026-10-04"
): Concert[] {
  const refTime = new Date(referenceDateStr).getTime();

  return [...concerts].sort((a, b) => {
    const aMinIso = a.dates.map((d) => d.isoDate).sort()[0] || "9999-99-99";
    const bMinIso = b.dates.map((d) => d.isoDate).sort()[0] || "9999-99-99";

    const aTime = new Date(aMinIso).getTime();
    const bTime = new Date(bMinIso).getTime();

    const aIsFuture = aTime >= refTime;
    const bIsFuture = bTime >= refTime;

    if (aIsFuture && !bIsFuture) return -1;
    if (!aIsFuture && bIsFuture) return 1;

    // If both future or both past, sort chronologically ascending
    return aTime - bTime;
  });
}

/**
 * Searches the concert catalog with a composer name or direct query.
 */
export function searchConcerts(
  query: string,
  options?: {
    resolvedComposer?: string;
    aiCommentary?: string;
    referenceDate?: string;
  }
): SearchResult {
  const effectiveQuery = options?.resolvedComposer || query;
  const matchedConcerts: Concert[] = [];
  const matchedCompositionsByConcertId: Record<string, Composition[]> = {};

  for (const concert of CONCERT_DATABASE) {
    const { isMatch, matchedPieces } = matchComposerDirect(
      concert,
      effectiveQuery
    );

    if (isMatch) {
      matchedConcerts.push(concert);
      matchedCompositionsByConcertId[concert.id] = matchedPieces;
    }
  }

  const sortedConcerts = sortConcertsByDate(
    matchedConcerts,
    options?.referenceDate || "2026-10-04"
  );

  return {
    query,
    resolvedComposer: options?.resolvedComposer,
    aiCommentary: options?.aiCommentary,
    concerts: sortedConcerts,
    matchedCompositionsByConcertId,
    totalConcerts: sortedConcerts.length,
    hasMatches: sortedConcerts.length > 0
  };
}
