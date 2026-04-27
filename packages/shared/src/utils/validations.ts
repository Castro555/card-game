// ─────────────────────────────────────────────
//  validations.ts
//  Pure guard functions used on BOTH client
//  (instant feedback) and server (authority).
//  No network calls. No side effects.
// ─────────────────────────────────────────────

import { RoomConfig, ScoringConfig } from "../constants/gameConfig";
import { isValidCapture, hasCard }   from "./cardUtils";
import type { Room }                 from "../types/room.types";
import type { Card }                 from "../types/card.types";
import type { CaptureAction, LayAction } from "../types/game.types";
import { RoomStatus }                from "../types/room.types";

// ── Result type ───────────────────────────────

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

const ok   = (): ValidationResult => ({ valid: true });
const fail = (reason: string): ValidationResult => ({ valid: false, reason });

// ── Player name ───────────────────────────────

export function validatePlayerName(name: unknown): ValidationResult {
  if (typeof name !== "string")        return fail("Name must be a string.");
  const t = name.trim();
  if (t.length < 2)                    return fail("Name must be at least 2 characters.");
  if (t.length > 20)                   return fail("Name must be 20 characters or fewer.");
  if (!/^[\w\s\-]+$/.test(t))         return fail("Name contains invalid characters.");
  return ok();
}

// ── Room code ─────────────────────────────────

export function validateRoomCode(code: unknown): ValidationResult {
  if (typeof code !== "string")        return fail("Room code must be a string.");
  const upper = code.trim().toUpperCase();
  if (upper.length !== RoomConfig.ROOM_CODE_LENGTH)
    return fail(`Room code must be exactly ${RoomConfig.ROOM_CODE_LENGTH} characters.`);
  if (!/^[A-Z0-9]+$/.test(upper))     return fail("Room code must be alphanumeric.");
  return ok();
}

// ── Room join / start ─────────────────────────

export function canJoinRoom(room: Room, playerId: string): ValidationResult {
  if (room.status !== RoomStatus.Waiting)
    return fail("This game has already started.");
  if (room.players.length >= room.maxPlayers)
    return fail("This room is full.");
  if (room.players.some(p => p.id === playerId))
    return fail("You are already in this room.");
  return ok();
}

export function canStartGame(room: Room, requesterId: string): ValidationResult {
  if (room.hostId !== requesterId)
    return fail("Only the host can start the game.");
  if (room.players.length < RoomConfig.MIN_PLAYERS)
    return fail(`At least ${RoomConfig.MIN_PLAYERS} players are needed to start.`);
  if (room.status !== RoomStatus.Waiting)
    return fail("The game has already started.");
  return ok();
}

// ── Turn ownership ────────────────────────────

export function isPlayerTurn(playerId: string, currentPlayerId: string): ValidationResult {
  if (playerId !== currentPlayerId) return fail("It is not your turn.");
  return ok();
}

// ── Capture action ────────────────────────────

/**
 * Validates a CaptureAction:
 * 1. The hand card must be in the player's hand.
 * 2. Every tableCardId must exist on the table.
 * 3. handCard.value + sum(selectedTableCards) must equal 15.
 */
export function validateCaptureAction(
  action:     CaptureAction,
  playerHand: Card[],
  tableCards: Card[],
): ValidationResult {
  // 1. Hand card ownership
  const handCard = playerHand.find(c => c.id === action.handCardId);
  if (!handCard)
    return fail("The card you played is not in your hand.");

  // 2. All selected table cards must be on the table
  if (action.tableCardIds.length === 0)
    return fail("You must select at least one table card to capture.");

  const selectedTableCards: Card[] = [];
  for (const id of action.tableCardIds) {
    const card = tableCards.find(c => c.id === id);
    if (!card) return fail(`Card "${id}" is not on the table.`);
    selectedTableCards.push(card);
  }

  // 3. Sum must equal 15
  if (!isValidCapture(handCard, selectedTableCards))
    return fail("Selected cards do not sum to 15 with your played card.");

  return ok();
}

// ── Lay action ────────────────────────────────

/**
 * Validates a LayAction:
 * The hand card must be in the player's hand.
 * (Player may lay even if a capture is possible — house rule.)
 */
export function validateLayAction(
  action:     LayAction,
  playerHand: Card[],
): ValidationResult {
  if (!hasCard(playerHand, action.handCardId))
    return fail("The card you want to lay is not in your hand.");
  return ok();
}

// ── Target score ─────────────────────────────

export function validateTargetScore(value: unknown): ValidationResult {
  const n = Number(value);
  if (!Number.isInteger(n))
    return fail("Target score must be a whole number.");
  if (n < ScoringConfig.MIN_TARGET_SCORE)
    return fail(`Target score must be at least ${ScoringConfig.MIN_TARGET_SCORE}.`);
  if (n > ScoringConfig.MAX_TARGET_SCORE)
    return fail(`Target score cannot exceed ${ScoringConfig.MAX_TARGET_SCORE}.`);
  return ok();
}

// ── Max players ───────────────────────────────

export function validateMaxPlayers(value: unknown): ValidationResult {
  const n = Number(value);
  if (!Number.isInteger(n))
    return fail("Max players must be a whole number.");
  if (n < RoomConfig.MIN_PLAYERS || n > RoomConfig.MAX_PLAYERS)
    return fail(`Players must be between ${RoomConfig.MIN_PLAYERS} and ${RoomConfig.MAX_PLAYERS}.`);
  return ok();
}
