// ─────────────────────────────────────────────
//  socket.types.ts
//  Strict typing for every Socket.io event.
//  Import on BOTH client and server — type
//  mismatches become compile errors, not bugs.
// ─────────────────────────────────────────────

import type { Room, CreateRoomPayload, JoinRoomPayload } from "./room.types";
import type { PersonalGameState, GameAction, GameScoreResult } from "./game.types";
import type { PublicPlayer } from "./player.types";

// ── Error envelope ───────────────────────────

export enum SocketErrorCode {
  RoomNotFound     = "ROOM_NOT_FOUND",
  RoomFull         = "ROOM_FULL",
  RoomInProgress   = "ROOM_IN_PROGRESS",
  NotYourTurn      = "NOT_YOUR_TURN",
  InvalidAction    = "INVALID_ACTION",
  InvalidCapture   = "INVALID_CAPTURE",   // sum ≠ 15, or card not on table
  CardNotInHand    = "CARD_NOT_IN_HAND",
  NotEnoughPlayers = "NOT_ENOUGH_PLAYERS",
  NotHost          = "NOT_HOST",
  AlreadyInRoom    = "ALREADY_IN_ROOM",
  GameNotStarted   = "GAME_NOT_STARTED",
  UnknownError     = "UNKNOWN_ERROR",
}

export interface SocketError {
  code: SocketErrorCode;
  message: string;
}

// ── Ack envelope ─────────────────────────────

/**
 * Every client event that expects a server confirmation
 * receives one of these in its callback.
 */
export type AckResponse<T> =
  | { success: true;  data: T }
  | { success: false; error: SocketError };

// ── Client → Server ───────────────────────────

export interface ClientToServerEvents {
  // Room lifecycle
  "room:create": (
    payload: CreateRoomPayload,
    ack: (res: AckResponse<{ room: Room }>) => void
  ) => void;

  "room:join": (
    payload: JoinRoomPayload,
    ack: (res: AckResponse<{ room: Room }>) => void
  ) => void;

  "room:leave": (
    ack: (res: AckResponse<void>) => void
  ) => void;

  "room:start": (
    ack: (res: AckResponse<void>) => void
  ) => void;

  /**
   * Single event for both CaptureAction and LayAction.
   * The server discriminates on action.type.
   */
  "game:action": (
    action: GameAction,
    ack: (res: AckResponse<void>) => void
  ) => void;

  // Chat
  "chat:message": (payload: { text: string }) => void;

  // Connection health
  "ping": (ack: (timestamp: number) => void) => void;
}

// ── Server → Client ───────────────────────────

export interface ServerToClientEvents {
  // Room updates
  "room:updated":       (room: Room) => void;
  "room:playerJoined":  (player: PublicPlayer) => void;
  "room:playerLeft":    (payload: { playerId: string; playerName: string }) => void;

  // Game flow
  "game:started":       (state: PersonalGameState) => void;

  /**
   * Sent to each player individually after every action.
   * Contains their personalised view of the board.
   */
  "game:stateUpdate":   (state: PersonalGameState) => void;

  /** Signals whose turn it is (broadcast to room) */
  "game:yourTurn":      (payload: { playerId: string; timeoutSeconds: number }) => void;

  /** A player was auto-skipped due to timeout */
  "game:turnSkipped":   (payload: { playerId: string; reason: "timeout" }) => void;

  /**
   * Sent when all hands are empty and new cards are dealt.
   * dealNumber reflects the new deal index.
   */
  "game:newDeal":       (payload: { dealNumber: number; totalDeals: number }) => void;

  /**
   * Sent when the last hand is exhausted and remaining table
   * cards are assigned to lastCapturePlayerId.
   */
  "game:tableCardsAwarded": (payload: {
    playerId: string;
    playerName: string;
    cardCount: number;
  }) => void;

  /** Full scoring breakdown at game end */
  "game:scored":        (result: GameScoreResult) => void;

  /** Match is over — a player reached targetScore */
  "game:ended":         (payload: {
    matchWinnerId: string;
    matchWinnerName: string;
    finalMatchScores: Record<string, number>;
  }) => void;

  // Player connectivity
  "player:reconnected": (player: PublicPlayer) => void;
  "player:disconnected":(payload: { playerId: string; playerName: string }) => void;

  // Chat
  "chat:message":       (payload: ChatMessage) => void;

  // Error (sent to a single client)
  "error":              (error: SocketError) => void;
}

// ── Inter-server events (Redis Pub/Sub) ──────

export interface InterServerEvents {
  "server:roomUpdate": (roomId: string) => void;
}

// ── Per-socket metadata ───────────────────────

export interface SocketData {
  playerId: string;
  playerName: string;
  roomId: string | null;
}

// ── Chat ─────────────────────────────────────

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  sentAt: string; // ISO timestamp
}
