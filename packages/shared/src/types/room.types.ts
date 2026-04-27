// ─────────────────────────────────────────────
//  room.types.ts
//  Models for the pre-game lobby and the
//  container that groups players together.
// ─────────────────────────────────────────────

import type { PublicPlayer } from "./player.types";

// ── Status ────────────────────────────────────

export enum RoomStatus {
  Waiting    = "WAITING",
  InProgress = "IN_PROGRESS",
  Finished   = "FINISHED",
}

// ── Core model ───────────────────────────────

export interface Room {
  /** Short human-readable code, e.g. "XK92" */
  code: string;
  id: string;
  status: RoomStatus;
  players: PublicPlayer[];
  hostId: string;
  maxPlayers: number;

  /**
   * Points needed to win the match.
   * Configured by the host before the game starts.
   */
  targetScore: number;

  createdAt: string;
  startedAt: string | null;
}

// ── Payloads ──────────────────────────────────

export interface CreateRoomPayload {
  playerName: string;
  maxPlayers?: number;  // defaults to 4
  targetScore?: number; // defaults to ScoringConfig.DEFAULT_TARGET_SCORE
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