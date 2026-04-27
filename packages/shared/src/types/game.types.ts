// ─────────────────────────────────────────────
//  game.types.ts
//  Full runtime state of a Scopa-variant game.
//
//  Key concepts:
//  - tableCards   : face-up cards anyone can capture
//  - capturedPile : each player's personal pile (scoring)
//  - scopas       : table-clear bonus counter per player
//  - dealNumber   : which dealing round we are in (1-based)
//  - lastCapturePlayerId : receives remaining table cards
//                          after the final play
// ─────────────────────────────────────────────

import type { Card }         from "./card.types";
import type { PublicPlayer } from "./player.types";

// ── Phase ─────────────────────────────────────

export enum GamePhase {
  /** Distributing cards to players (and table on deal 1) */
  Dealing    = "DEALING",
  /** Waiting for the active player's action */
  Playing    = "PLAYING",
  /**
   * All cards have been played; assigning remaining table cards
   * to the last player who made a successful capture.
   */
  Evaluating = "EVALUATING",
  /** Tallying captured piles → awarding point categories */
  Scoring    = "SCORING",
  /** A player reached targetScore; match over */
  GameOver   = "GAME_OVER",
}

// ── Turn ─────────────────────────────────────

export interface Turn {
  currentPlayerId: string;
  /** 1-based index within the current deal */
  turnNumber: number;
  startedAt: string;       // ISO timestamp
  timeoutSeconds: number;
}

// ── Player actions (client → server) ─────────

/**
 * The player plays a card from their hand AND captures one or
 * more table cards whose values + handCard.value === 15.
 * The server validates the sum before accepting.
 */
export interface CaptureAction {
  type: "capture";
  handCardId: string;
  /** IDs of table cards to capture. Must sum to 15 with handCard. */
  tableCardIds: string[];
}

/**
 * The player places a card from their hand onto the table.
 * No capture is made — either by choice or because none is possible.
 */
export interface LayAction {
  type: "lay";
  handCardId: string;
}

export type GameAction = CaptureAction | LayAction;

// ── Capture event record ──────────────────────

export interface CaptureRecord {
  playerId: string;
  handCard: Card;
  capturedCards: Card[];   // tableCards taken + handCard itself
  wasScopa: boolean;       // true if the table was left empty
  turnNumber: number;
}

// ── End-of-game scoring ───────────────────────

export interface PlayerScoreBreakdown {
  playerId: string;
  playerName: string;

  /** 1 point per scopa scored during the game */
  scopaPoints: number;

  /** 1 point for most cards in captured pile (no award on draw) */
  mostCardsPoint: number;

  /** 1 point for most Diamonds in captured pile (no award on draw) */
  mostDiamondsPoint: number;

  /** 1 point for most Sevens in captured pile (no award on draw) */
  mostSevensPoint: number;

  /** 1 point for holding the Seven of Diamonds */
  sevenOfDiamondsPoint: number;

  /** Sum of all the above */
  totalPoints: number;
}

export interface GameScoreResult {
  breakdown: PlayerScoreBreakdown[];
  /** Player with the highest totalPoints this game */
  gameWinnerId: string;
  /** Updated cumulative match scores keyed by playerId */
  matchScores: Record<string, number>;
  /** Set when a player has reached or exceeded targetScore */
  matchWinnerId: string | null;
}

// ── Core game state ───────────────────────────

export interface GameState {
  roomId: string;
  phase: GamePhase;

  /** Public projection of all players */
  players: PublicPlayer[];

  /** Cards currently face-up on the table, available for capture */
  tableCards: Card[];

  /** Number of cards remaining in the draw pile */
  deckCount: number;

  /**
   * Which dealing round we are in (1-based).
   * Increments each time all hands have been emptied and new
   * cards are distributed.
   *
   * Max values: 2p→6, 3p→4, 4p→3
   */
  dealNumber: number;

  /** Total dealing rounds for this game (derived from player count) */
  totalDeals: number;

  currentTurn: Turn;

  /**
   * ID of the last player who successfully captured cards.
   * At the end of the final deal, remaining table cards go to them.
   */
  lastCapturePlayerId: string | null;

  /** Running log of every capture made this game */
  captureHistory: CaptureRecord[];

  /** Points needed to win the match */
  targetScore: number;

  /** Cumulative match scores keyed by playerId */
  matchScores: Record<string, number>;

  /** Populated once phase transitions to Scoring / GameOver */
  scoreResult: GameScoreResult | null;

  updatedAt: string; // ISO timestamp
}

// ── Personalised snapshot (server → one client) ──

/**
 * Sent to each client individually.
 * myHand contains the real Card objects (suit + rank visible).
 * Other players' hands are PublicPlayer (cardCount only).
 */
export interface PersonalGameState extends Omit<GameState, "players"> {
  players: PublicPlayer[];
  myHand: Card[];
  myPlayerId: string;
}
