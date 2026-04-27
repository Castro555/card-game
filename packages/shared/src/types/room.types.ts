// ─────────────────────────────────────────────
//  room.types.ts
//  Models for the pre-game lobby and the
//  container that groups players together.
// ─────────────────────────────────────────────

import type { PublicPlayer } from "./player.types";

// ── Status ────────────────────────────────────

export enum RoomStatus {
  /** Waiting for players to join */
  Waiting    = "WAITING",
  /** All players ready; game is running */
  InProgress = "IN_PROGRESS",
  /** Game finished; scores visible */
  Finished   = "FINISHED",
}

// ── Core model ───────────────────────────────

export interface Room {
  /** Short human-readable code shared with friends, e.g. "XK92" */
  code: string;
  /** Unique internal ID (UUID) */
  id: string;
  status: RoomStatus;
  /** All players currently in the room (public view) */
  players: PublicPlayer[];
  /** Socket ID of the host player */
  hostId: string;
  /** Maximum allowed players (2–4) */
  maxPlayers: number;
  /** Current round number (1-indexed) */
  round: number;
  /** Total rounds to play before game ends */
  totalRounds: number;
  /** ISO timestamp when the room was created */
  createdAt: string;
  /** ISO timestamp when the game started, null if not yet started */
  startedAt: string | null;
}

// ── Request / response payloads ───────────────

export interface CreateRoomPayload {
  playerName: string;
  maxPlayers?: number;   // defaults to 4
  totalRounds?: number;  // defaults to 1
}

export interface JoinRoomPayload {
  roomCode: string;
  playerName: string;
}

export interface RoomSummary {
  code: string;
  playerCount: number;
  maxPlayers: number;
  status: RoomStatus;
}

// ── Helpers ───────────────────────────────────

export function isRoomFull(room: Pick<Room, "players" | "maxPlayers">): boolean {
  return room.players.length >= room.maxPlayers;
}

export function isRoomOpen(room: Pick<Room, "status" | "players" | "maxPlayers">): boolean {
  return room.status === RoomStatus.Waiting && !isRoomFull(room);
}