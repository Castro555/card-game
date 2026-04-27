// ─────────────────────────────────────────────
//  cardUtils.ts
//  Pure functions for card manipulation.
//  No side effects. No external dependencies.
// ─────────────────────────────────────────────

import { Suit, Rank, cardValue, type Card, type AnyCard } from "../types/card.types";
import { DeckConfig } from "../constants/gameConfig";

// ── Deck factory ──────────────────────────────

/**
 * Builds a full 40-card deck (Ace–Ten, 4 suits), all face-up.
 * IDs follow the pattern "SPADES_1", "DIAMONDS_7", etc.
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

  // Safety assertion — should always be 40
  if (deck.length !== DeckConfig.TOTAL_CARDS) {
    throw new Error(`Deck size mismatch: expected ${DeckConfig.TOTAL_CARDS}, got ${deck.length}`);
  }

  return deck;
}

// ── Shuffle ───────────────────────────────────

/**
 * Returns a NEW shuffled array. Does not mutate the input.
 * Uses Fisher-Yates algorithm.
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
  hands:     Card[][];  // one array per player
  remaining: Card[];    // what's left in the deck after dealing
}

/**
 * Deals `cardsPerPlayer` to each of `playerCount` players.
 * Returns new arrays — does not mutate the input deck.
 * Cards are dealt round-robin (player 0 first, then 1, …).
 */
export function deal(deck: Card[], playerCount: number, cardsPerPlayer: number): DealResult {
  const needed = playerCount * cardsPerPlayer;
  if (needed > deck.length) {
    throw new Error(
      `Cannot deal ${cardsPerPlayer} cards to ${playerCount} players ` +
      `from a deck of only ${deck.length} cards.`
    );
  }

  const copy = [...deck];
  const hands: Card[][] = Array.from({ length: playerCount }, () => []);

  // Round-robin deal
  for (let round = 0; round < cardsPerPlayer; round++) {
    for (let p = 0; p < playerCount; p++) {
      hands[p].push(copy.shift()!);
    }
  }

  return { hands, remaining: copy };
}

/**
 * Draws the first `count` cards from the top of the deck.
 * Returns new arrays — does not mutate.
 */
export function drawFromTop(deck: Card[], count: number): { drawn: Card[]; remaining: Card[] } {
  if (count > deck.length) {
    throw new Error(`Cannot draw ${count} cards from a deck of ${deck.length}.`);
  }
  return {
    drawn:     deck.slice(0, count),
    remaining: deck.slice(count),
  };
}

// ── Hand operations ───────────────────────────

export function cardById(cards: Card[], id: string): Card | undefined {
  return cards.find(c => c.id === id);
}

export function hasCard(hand: Card[], cardId: string): boolean {
  return hand.some(c => c.id === cardId);
}

/** Returns a new hand with the specified card removed */
export function removeCard(hand: Card[], cardId: string): Card[] {
  return hand.filter(c => c.id !== cardId);
}

/** Returns a new array with all specified cards removed */
export function removeCards(cards: Card[], ids: string[]): Card[] {
  const idSet = new Set(ids);
  return cards.filter(c => !idSet.has(c.id));
}

// ── Capture / sum-15 logic ────────────────────

/** Sum of all card values in the array */
export function sumValues(cards: Card[]): number {
  return cards.reduce((acc, c) => acc + cardValue(c), 0);
}

/**
 * Checks whether playing `handCard` against `selected` table cards
 * produces a valid capture (handCard.value + sum(selected) === 15).
 */
export function isValidCapture(handCard: Card, selected: Card[]): boolean {
  if (selected.length === 0) return false;
  return cardValue(handCard) + sumValues(selected) === 15;
}

/**
 * Finds ALL combinations of table cards that can be captured
 * together with `handCard` (i.e. handCard.value + combo = 15).
 *
 * Returns an array of valid combinations (each is a Card[]).
 * An empty array means no capture is possible with this hand card.
 *
 * Uses power-set enumeration — fine for a table of ≤ ~12 cards.
 */
export function findCaptureCombinations(handCard: Card, tableCards: Card[]): Card[][] {
  const target = 15 - cardValue(handCard);
  if (target <= 0 || target > sumValues(tableCards)) return [];

  const results: Card[][] = [];
  const n = tableCards.length;

  // Enumerate all non-empty subsets
  for (let mask = 1; mask < (1 << n); mask++) {
    const subset: Card[] = [];
    let total = 0;
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        subset.push(tableCards[i]);
        total += cardValue(tableCards[i]);
      }
    }
    if (total === target) results.push(subset);
  }

  return results;
}

/**
 * Returns true if the player has at least one valid capture available
 * with ANY card in their hand against the current table.
 */
export function hasCaptureAvailable(hand: Card[], tableCards: Card[]): boolean {
  return hand.some(c => findCaptureCombinations(c, tableCards).length > 0);
}

// ── Scoring helpers ───────────────────────────

/** Count cards of a specific suit in a pile */
export function countBySuit(pile: Card[], suit: Suit): number {
  return pile.filter(c => c.suit === suit).length;
}

/** Count cards of a specific rank in a pile */
export function countByRank(pile: Card[], rank: Rank): number {
  return pile.filter(c => c.rank === rank).length;
}

/** Returns true if the pile contains the Seven of Diamonds */
export function hasSevenOfDiamonds(pile: Card[]): boolean {
  return pile.some(c => c.suit === Suit.Diamonds && c.rank === Rank.Seven);
}

// ── Visibility ────────────────────────────────

/** Returns a hidden version of the card (for broadcasting to opponents) */
export function hideCard(card: Card): AnyCard {
  return { id: card.id, suit: null, rank: null, faceUp: false };
}

export function hideHand(hand: Card[]): AnyCard[] {
  return hand.map(hideCard);
}
