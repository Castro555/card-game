// ─────────────────────────────────────────────
//  card.types.ts
//  40-card deck: 4 suits × 10 ranks (Ace–Ten).
//  No Jack, Queen or King — per game rules.
//  Card value = rank value (Ace=1 … Ten=10).
// ─────────────────────────────────────────────

export enum Suit {
  Spades   = "SPADES",
  Hearts   = "HEARTS",
  Diamonds = "DIAMONDS",
  Clubs    = "CLUBS",
}

/** Ranks Ace(1) through Ten(10). No face cards in this game. */
export enum Rank {
  Ace   = 1,
  Two   = 2,
  Three = 3,
  Four  = 4,
  Five  = 5,
  Six   = 6,
  Seven = 7,
  Eight = 8,
  Nine  = 9,
  Ten   = 10,
}

export interface Card {
  /** Unique identifier, e.g. "SPADES_1", "DIAMONDS_7" */
  id: string;
  suit: Suit;
  rank: Rank;
  /** true = visible to all; false = hidden (opponent's hand) */
  faceUp: boolean;
}

/** Opponent's card: identity concealed, only the id is exposed */
export type HiddenCard = Omit<Card, "suit" | "rank"> & {
  suit: null;
  rank: null;
  faceUp: false;
};

/** Union for rendering — own hand: Card; opponents: HiddenCard */
export type AnyCard = Card | HiddenCard;

// ── Type guards ───────────────────────────────

export function isHiddenCard(card: AnyCard): card is HiddenCard {
  return card.suit === null;
}

export function isRevealedCard(card: AnyCard): card is Card {
  return card.suit !== null;
}

// ── Value & display ───────────────────────────

/**
 * Point value of a card in the capture/sum mechanic.
 * Equals the numeric rank: Ace = 1, Seven = 7, Ten = 10.
 */
export function cardValue(card: Card): number {
  return card.rank;
}

/** "7", "A", "10" … */
export function rankLabel(rank: Rank): string {
  if (rank === Rank.Ace) return "A";
  return String(rank);
}

/** "♠" "♥" "♦" "♣" */
export function suitSymbol(suit: Suit): string {
  const map: Record<Suit, string> = {
    [Suit.Spades]:   "♠",
    [Suit.Hearts]:   "♥",
    [Suit.Diamonds]: "♦",
    [Suit.Clubs]:    "♣",
  };
  return map[suit];
}

/** Full label: "A♥", "7♦", "🂠" (hidden) */
export function cardLabel(card: AnyCard): string {
  if (isHiddenCard(card)) return "🂠";
  const c = card as Card;
  return `${rankLabel(c.rank)}${suitSymbol(c.suit)}`;
}