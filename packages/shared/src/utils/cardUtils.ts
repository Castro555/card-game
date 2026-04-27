// ─────────────────────────────────────────────
//  cardUtils.ts
//  Pure functions for card manipulation.
//  No side effects, no dependencies outside
//  the shared package.
// ─────────────────────────────────────────────

import { Suit, Rank, type Card, type AnyCard, rankLabel, suitSymbol } from "../types/card.types";

// ── Deck factory ──────────────────────────────

/**
 * Builds a full 52-card deck, all face-up.
 * IDs follow the pattern "HEARTS_1", "SPADES_13", etc.
 */
export function createDeck(): Card[] {
  const suits  = Object.values(Suit);
  const ranks  = Object.values(Rank).filter((v): v is Rank => typeof v === "number");
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ id: `${suit}_${rank}`, suit, rank, faceUp: true });
    }
  }

  return deck;
}

// ── Shuffle ───────────────────────────────────

/**
 * Returns a NEW shuffled array — does not mutate the input.
 * Uses the Fisher-Yates algorithm.
 */
export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ── Deal ─────────────────────────────────────

export interface DealResult {
  hands: Card[][];
  remaining: Card[];
}

/**
 * Deals `cardsPerPlayer` cards to each of `playerCount` players.
 * Returns new arrays — does not mutate the deck.
 */
export function deal(deck: Card[], playerCount: number, cardsPerPlayer: number): DealResult {
  if (playerCount * cardsPerPlayer > deck.length) {
    throw new Error(
      `Cannot deal ${cardsPerPlayer} cards to ${playerCount} players from a deck of ${deck.length}.`
    );
  }

  const hands: Card[][] = Array.from({ length: playerCount }, () => []);
  const copy = [...deck];

  for (let i = 0; i < cardsPerPlayer; i++) {
    for (let p = 0; p < playerCount; p++) {
      hands[p].push(copy.pop()!);
    }
  }

  return { hands, remaining: copy };
}

// ── Card queries ──────────────────────────────

export function cardById(cards: Card[], id: string): Card | undefined {
  return cards.find(c => c.id === id);
}

export function hasCard(hand: Card[], cardId: string): boolean {
  return hand.some(c => c.id === cardId);
}

/** Remove a card from the hand, returning a new array */
export function removeCard(hand: Card[], cardId: string): Card[] {
  return hand.filter(c => c.id !== cardId);
}

// ── Comparison ────────────────────────────────

/**
 * Compares two cards by rank.
 * Returns negative if a < b, 0 if equal, positive if a > b.
 */
export function compareByRank(a: Card, b: Card): number {
  return a.rank - b.rank;
}

export function highestCard(cards: Card[]): Card | null {
  if (cards.length === 0) return null;
  return [...cards].sort((a, b) => b.rank - a.rank)[0];
}

// ── Display helpers ───────────────────────────

/** E.g. { suit: Suit.Hearts, rank: Rank.Ace } → "A♥" */
export function cardLabel(card: AnyCard): string {
  if (!card.faceUp) return "🂠";
  const c = card as Card;
  return `${rankLabel(c.rank)}${suitSymbol(c.suit)}`;
}

/** Hides suit and rank for safe broadcast to opponents */
export function hideCard(card: Card): AnyCard {
  return { id: card.id, suit: null, rank: null, faceUp: false };
}

export function hideHand(hand: Card[]): AnyCard[] {
  return hand.map(hideCard);
}