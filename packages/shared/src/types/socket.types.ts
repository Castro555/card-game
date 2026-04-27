// ─────────────────────────────────────────────
//  socket.types.ts
//  Strict typing for every Socket.io event.
//  Import this on BOTH client and server so
//  mismatches are caught at compile time.
// ─────────────────────────────────────────────

import type { Room, CreateRoomPayload, JoinRoomPayload } from "./room.types";
import type { PersonalGameState, PlayCardAction, DrawCardAction } from "./game.types";
import type { PublicPlayer } from "./player.types";

// ── Error envelope ───────────────────────────

export interface SocketError {
  code: SocketErrorCode;
  message: string;
}

export enum SocketErrorCode {
  RoomNotFound      = "ROOM_NOT_FOUND",
  RoomFull          = "ROOM_FULL",
  RoomInProgress    = "ROOM_IN_PROGRESS",
  NotYourTurn       = "NOT_YOUR_TURN",
  InvalidCard       = "INVALID_CARD",
  NotEnoughPlayers  = "NOT_ENOUGH_PLAYERS",
  NotHost           = "NOT_HOST",
  AlreadyInRoom     = "ALREADY_IN_ROOM",
  GameNotStarted    = "GAME_NOT_STARTED",
  UnknownError      = "UNKNOWN_ERROR",
}

// ── Client → Server events ───────────────────

export interface ClientToServerEvents {
  // Room lifecycle
  "room:create": (
    payload: CreateRoomPayload,
    ack: (response: AckResponse<{ room: Room }>) => void
  ) => void;

  "room:join": (
    payload: JoinRoomPayload,
    ack: (response: AckResponse<{ room: Room }>) => void
  ) => void;

  "room:leave": (
    ack: (response: AckResponse<void>) => void
  ) => void;

  "room:start": (
    ack: (response: AckResponse<void>) => void
  ) => void;

  // In-game actions
  "game:playCard": (
    payload: PlayCardAction,
    ack: (response: AckResponse<void>) => void
  ) => void;

  "game:drawCard": (
    payload: DrawCardAction,
    ack: (response: AckResponse<void>) => void
  ) => void;

  // Chat
  "chat:message": (payload: { text: string }) => void;

  // Connection health
  "ping": (ack: (timestamp: number) => void) => void;
}

// ── Server → Client events ───────────────────

export interface ServerToClientEvents {
  // Room updates
  "room:updated":       (room: Room) => void;
  "room:playerJoined":  (player: PublicPlayer) => void;
  "room:playerLeft":    (payload: { playerId: string; playerName: string }) => void;

  // Game flow
  "game:started":       (state: PersonalGameState) => void;
  "game:stateUpdate":   (state: PersonalGameState) => void;
  "game:yourTurn":      (payload: { timeoutSeconds: number }) => void;
  "game:turnSkipped":   (payload: { playerId: string; reason: "timeout" }) => void;
  "game:roundEnded":    (payload: { roundNumber: number; scores: Record<string, number> }) => void;
  "game:ended":         (payload: { winnerId: string; finalScores: Record<string, number> }) => void;

  // Player connectivity
  "player:reconnected": (player: PublicPlayer) => void;
  "player:disconnected":(payload: { playerId: string; playerName: string }) => void;

  // Chat
  "chat:message":       (payload: ChatMessage) => void;

  // Errors
  "error":              (error: SocketError) => void;
}

// ── Inter-server events (for Redis Pub/Sub) ──

export interface InterServerEvents {
  "server:roomUpdate": (roomId: string) => void;
}

// ── Socket data (stored per socket) ──────────

export interface SocketData {
  playerId: string;
  playerName: string;
  roomId: string | null;
}

// ── Helpers ───────────────────────────────────

/**
 * Standard acknowledgement envelope.
 * Every client-emitted event that expects confirmation
 * receives one of these in the callback.
 */
export type AckResponse<T> =
  | { success: true;  data: T }
  | { success: false; error: SocketError };

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  sentAt: string; // ISO timestamp
}