// ─────────────────────────────────────────────
//  player.types.ts
//  Everything that describes a participant in
//  a game session, from lobby to end screen.
// ─────────────────────────────────────────────

import type { AnyCard } from "./card.types";

// ── Status ────────────────────────────────────

export enum PlayerStatus {
  /** Connected and in the lobby, not yet in a room */
  Idle        = "IDLE",
  /** Sitting in a room, waiting for the game to start */
  InLobby     = "IN_LOBBY",
  /** Actively playing a game */
  Playing     = "PLAYING",
  /** Temporarily disconnected, may reconnect */
  Disconnected = "DISCONNECTED",
}

export enum PlayerRole {
  /** Created the room; can start the game */
  Host   = "HOST",
  /** Joined an existing room */
  Guest  = "GUEST",
}

// ── Core model ───────────────────────────────

export interface Player {
  /** Socket ID assigned on connection */
  id: string;
  name: string;
  status: PlayerStatus;
  role: PlayerRole;
  /** Cards currently in this player's hand.
   *  Opponents only see HiddenCard entries. */
  hand: AnyCard[];
  /** Cumulative score across rounds */
  score: number;
  /** Whether this player has finished their turn action */
  hasActed: boolean;
  /** ISO timestamp of the last received message */
  lastSeenAt: string;
}

// ── Derived / view models ─────────────────────

/**
 * Safe projection sent to OTHER players — hides hand contents.
 * The server strips the actual cards before broadcasting.
 */
export type PublicPlayer = Omit<Player, "hand"> & {
  /** Number of cards still in hand (not their identity) */
  cardCount: number;
};

/** What the player sees about themselves: full hand visible */
export type PrivatePlayer = Player;

// ── Helpers ───────────────────────────────────

export function isHost(player: Pick<Player, "role">): boolean {
  return player.role === PlayerRole.Host;
}

export function isConnected(player: Pick<Player, "status">): boolean {
  return player.status !== PlayerStatus.Disconnected;
}