// ─────────────────────────────────────────────
//  validations.ts
//  Pure guard functions shared between client
//  (instant feedback) and server (authoritative).
// ─────────────────────────────────────────────

import { RoomConfig, DeckConfig, TurnConfig, ScoringConfig } from "../constants/gameConfig";
import type { Room }   from "../types/room.types";
import type { Player } from "../types/player.types";
import type { Card }   from "../types/card.types";
import { RoomStatus }  from "../types/room.types";

// ── Result type ───────────────────────────────

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

const ok  = (): ValidationResult => ({ valid: true });
const fail = (reason: string): ValidationResult => ({ valid: false, reason });

// ── Player name ───────────────────────────────

export function validatePlayerName(name: unknown): ValidationResult {
  if (typeof name !== "string")       return fail("Name must be a string.");
  const trimmed = name.trim();
  if (trimmed.length < 2)            return fail("Name must be at least 2 characters.");
  if (trimmed.length > 20)           return fail("Name must be 20 characters or fewer.");
  if (!/^[\w\s\-]+$/.test(trimmed)) return fail("Name contains invalid characters.");
  return ok();
}

// ── Room code ─────────────────────────────────

export function validateRoomCode(code: unknown): ValidationResult {
  if (typeof code !== "string")       return fail("Room code must be a string.");
  const upper = code.trim().toUpperCase();
  if (upper.length !== RoomConfig.ROOM_CODE_LENGTH)
    return fail(`Room code must be exactly ${RoomConfig.ROOM_CODE_LENGTH} characters.`);
  if (!/^[A-Z0-9]+$/.test(upper))   return fail("Room code must be alphanumeric.");
  return ok();
}

// ── Join room ─────────────────────────────────

export function canJoinRoom(room: Room, playerId: string): ValidationResult {
  if (room.status !== RoomStatus.Waiting)
    return fail("This game has already started.");
  if (room.players.length >= room.maxPlayers)
    return fail("This room is full.");
  if (room.players.some(p => p.id === playerId))
    return fail("You are already in this room.");
  return ok();
}

// ── Start game ────────────────────────────────

export function canStartGame(room: Room, requesterId: string): ValidationResult {
  if (room.hostId !== requesterId)
    return fail("Only the host can start the game.");
  if (room.players.length < RoomConfig.MIN_PLAYERS)
    return fail(`Need at least ${RoomConfig.MIN_PLAYERS} players to start.`);
  if (room.status !== RoomStatus.Waiting)
    return fail("Game has already started.");
  return ok();
}

// ── Play card ─────────────────────────────────

export function canPlayCard(
  playerId: string,
  currentPlayerId: string,
  hand: Card[],
  cardId: string
): ValidationResult {
  if (playerId !== currentPlayerId)
    return fail("It is not your turn.");
  if (hand.length === 0)
    return fail("Your hand is empty.");
  if (!hand.some(c => c.id === cardId))
    return fail("You do not have that card.");
  return ok();
}

// ── Hand size ─────────────────────────────────

export function isHandOverLimit(hand: Card[]): boolean {
  return hand.length > DeckConfig.MAX_HAND_SIZE;
}

// ── Round config ─────────────────────────────

export function validateTotalRounds(value: unknown): ValidationResult {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1)
    return fail("Total rounds must be a positive integer.");
  if (n > ScoringConfig.MAX_TOTAL_ROUNDS)
    return fail(`Maximum allowed rounds is ${ScoringConfig.MAX_TOTAL_ROUNDS}.`);
  return ok();
}

export function validateMaxPlayers(value: unknown): ValidationResult {
  const n = Number(value);
  if (!Number.isInteger(n))
    return fail("Max players must be an integer.");
  if (n < RoomConfig.MIN_PLAYERS || n > RoomConfig.MAX_PLAYERS)
    return fail(`Players must be between ${RoomConfig.MIN_PLAYERS} and ${RoomConfig.MAX_PLAYERS}.`);
  return ok();
}