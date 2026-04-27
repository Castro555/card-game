// ─────────────────────────────────────────────
//  player.types.ts
//  A participant from lobby through end screen.
// ─────────────────────────────────────────────

import type { AnyCard, Card } from "./card.types";

// ── Status & role ─────────────────────────────

export enum PlayerStatus {
  Idle         = "IDLE",
  InLobby      = "IN_LOBBY",
  Playing      = "PLAYING",
  Disconnected = "DISCONNECTED",
}

export enum PlayerRole {
  Host  = "HOST",
  Guest = "GUEST",
}

// ── Core model ───────────────────────────────

export interface Player {
  /** Socket ID */
  id: string;
  name: string;
  status: PlayerStatus;
  role: PlayerRole;

  /** Cards currently held (max 3).
   *  Other players only see HiddenCard entries. */
  hand: AnyCard[];

  /**
   * Cards the player has captured during the game.
   * Used at the end to compute all scoring categories.
   * Visible to everyone (face-up) — no information hiding needed.
   */
  capturedPile: Card[];

  /**
   * Number of "Scopas" scored — each time this player
   * cleared the table completely by summing 15.
   */
  scopas: number;

  /** Cumulative match score across games */
  matchScore: number;

  /** Consecutive turns skipped due to timeout */
  consecutiveSkips: number;

  lastSeenAt: string; // ISO timestamp
}

// ── Projected views ───────────────────────────

/**
 * What OTHER players see:
 * - hand contents hidden (only count exposed)
 * - capturedPile visible (card count matters strategically)
 */
export type PublicPlayer = Omit<Player, "hand"> & {
  cardCount: number;
};

/** What the player sees about themselves: full hand revealed */
export type PrivatePlayer = Player & { hand: Card[] };

// ── Helpers ───────────────────────────────────

export function isHost(player: Pick<Player, "role">): boolean {
  return player.role === PlayerRole.Host;
}

export function isConnected(player: Pick<Player, "status">): boolean {
  return player.status !== PlayerStatus.Disconnected;
}

export function capturedCardCount(player: Pick<Player, "capturedPile">): number {
  return player.capturedPile.length;
}