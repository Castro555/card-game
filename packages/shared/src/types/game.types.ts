// ─────────────────────────────────────────────
//  game.types.ts
//  The full runtime state of a game session.
//  This is what the server holds in Redis and
//  broadcasts (projected) to each client.
// ─────────────────────────────────────────────

import type { Card }          from "./card.types";
import type { PublicPlayer }  from "./player.types";

// ── Phase ─────────────────────────────────────

export enum GamePhase {
  /** Cards being dealt, not yet interactive */
  Dealing    = "DEALING",
  /** Waiting for the current player's action */
  Playing    = "PLAYING",
  /** Evaluating who won the trick / round */
  Evaluating = "EVALUATING",
  /** Round over; scores updated */
  RoundEnd   = "ROUND_END",
  /** All rounds done; winner decided */
  GameOver   = "GAME_OVER",
}

// ── Turn ─────────────────────────────────────

export interface Turn {
  /** ID of the player whose turn it is */
  currentPlayerId: string;
  /** Turn number within the current round (1-indexed) */
  turnNumber: number;
  /** ISO timestamp when this turn started (for timeout tracking) */
  startedAt: string;
  /** Seconds the player has to act before auto-skip */
  timeoutSeconds: number;
}

// ── Trick (one play cycle around the table) ───

export interface TrickCard {
  playerId: string;
  card: Card;
  /** Order in which the card was played this trick */
  playOrder: number;
}

export interface Trick {
  trickNumber: number;
  cards: TrickCard[];
  /** ID of the player who won this trick (null while in progress) */
  winnerId: string | null;
}

// ── Round result ──────────────────────────────

export interface RoundResult {
  roundNumber: number;
  /** Points earned this round, keyed by playerId */
  pointsEarned: Record<string, number>;
  /** ID of the player with the highest score this round */
  roundWinnerId: string;
}

// ── Core game state ───────────────────────────

export interface GameState {
  roomId: string;
  phase: GamePhase;
  /** Public view of players (hand contents hidden for opponents) */
  players: PublicPlayer[];
  /** Cards remaining in the draw pile */
  deckCount: number;
  /** Cards on the discard pile (top card visible) */
  discardPile: Card[];
  currentTurn: Turn;
  currentTrick: Trick;
  completedTricks: Trick[];
  currentRound: number;
  totalRounds: number;
  roundResults: RoundResult[];
  /** Cumulative scores keyed by playerId */
  scores: Record<string, number>;
  /** Set when phase === GameOver */
  winnerId: string | null;
  /** ISO timestamp of last state change */
  updatedAt: string;
}

// ── Action payloads (client → server) ────────

export interface PlayCardAction {
  cardId: string;
}

export interface DrawCardAction {
  /** "deck" draws from the pile, "discard" takes the top discard */
  source: "deck" | "discard";
}

// ── Projected state (server → specific client) ─

/**
 * The server sends each player a personalised snapshot:
 * their own hand is fully visible, others are counts only.
 */
export interface PersonalGameState extends Omit<GameState, "players"> {
  players: PublicPlayer[];
  /** This client's own full hand */
  myHand: Card[];
  myPlayerId: string;
}