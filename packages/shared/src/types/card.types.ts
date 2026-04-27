// ─────────────────────────────────────────────
//  card.types.ts
//  Fundamental card domain types.
//  All game logic builds on top of these.
// ─────────────────────────────────────────────

export enum Suit {
  Spades   = "SPADES",
  Hearts   = "HEARTS",
  Diamonds = "DIAMONDS",
  Clubs    = "CLUBS",
}

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
  Jack  = 11,
  Queen = 12,
  King  = 13,
}

export interface Card {
  /** Unique identifier within a deck instance, e.g. "SPADES_1" */
  id: string;
  suit: Suit;
  rank: Rank;
  /** Face-up or hidden (opponent's hand view) */
  faceUp: boolean;
}

/** A card that has not yet been revealed to a specific player */
export type HiddenCard = Omit<Card, "suit" | "rank"> & {
  suit: null;
  rank: null;
  faceUp: false;
};

/** Union useful for rendering an opponent's hand */
export type AnyCard = Card | HiddenCard;

export function isHiddenCard(card: AnyCard): card is HiddenCard {
  return !card.faceUp;
}

/** Human-readable label for a rank, e.g. Rank.Jack → "J" */
export function rankLabel(rank: Rank): string {
  const labels: Record<Rank, string> = {
    [Rank.Ace]:   "A",
    [Rank.Two]:   "2",
    [Rank.Three]: "3",
    [Rank.Four]:  "4",
    [Rank.Five]:  "5",
    [Rank.Six]:   "6",
    [Rank.Seven]: "7",
    [Rank.Eight]: "8",
    [Rank.Nine]:  "9",
    [Rank.Ten]:   "10",
    [Rank.Jack]:  "J",
    [Rank.Queen]: "Q",
    [Rank.King]:  "K",
  };
  return labels[rank];
}

/** Human-readable label for a suit, e.g. Suit.Hearts → "♥" */
export function suitSymbol(suit: Suit): string {
  const symbols: Record<Suit, string> = {
    [Suit.Spades]:   "♠",
    [Suit.Hearts]:   "♥",
    [Suit.Diamonds]: "♦",
    [Suit.Clubs]:    "♣",
  };
  return symbols[suit];
}