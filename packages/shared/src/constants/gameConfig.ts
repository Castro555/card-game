// ─────────────────────────────────────────────
//  gameConfig.ts
//  All tuneable game parameters.
//  Change here → takes effect everywhere.
// ─────────────────────────────────────────────

// ── Room ─────────────────────────────────────

export const RoomConfig = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 4,
  ROOM_CODE_LENGTH: 4,
  /** Minutes before an empty/idle room is purged from Redis */
  ROOM_TTL_MINUTES: 120,
} as const;

// ── Deck & dealing ────────────────────────────

export const DeckConfig = {
  /** 4 suits × 10 ranks (Ace–Ten, no face cards) */
  TOTAL_CARDS: 40,

  /** Cards dealt to each player per dealing round */
  INITIAL_HAND_SIZE: 3,

  /**
   * A player's hand never exceeds 3 — new cards are only dealt
   * when all players have emptied their hands.
   */
  MAX_HAND_SIZE: 3,

  /** Cards placed face-up on the table at game start */
  TABLE_INITIAL_CARDS: 4,

  /**
   * Cards available for dealing to players after table setup:
   * 40 - 4 = 36.
   *
   * Dealing rounds per player count:
   *   2 players → 36 ÷ (2×3) = 6 deals
   *   3 players → 36 ÷ (3×3) = 4 deals
   *   4 players → 36 ÷ (4×3) = 3 deals
   */
  CARDS_FOR_PLAYERS: 36,
} as const;

// ── Turn & timing ─────────────────────────────

export const TurnConfig = {
  /** Seconds before the server auto-skips an idle player */
  TURN_TIMEOUT_SECONDS: 30,

  /** Extra seconds given after a reconnection */
  RECONNECT_GRACE_SECONDS: 15,

  /** Consecutive auto-skips before a player is removed */
  MAX_CONSECUTIVE_SKIPS: 3,
} as const;

// ── Scoring ───────────────────────────────────

export const ScoringConfig = {
  /**
   * Default points needed to win the match.
   * The host can configure this at room creation.
   */
  DEFAULT_TARGET_SCORE: 11,

  /** Minimum target score the host can set */
  MIN_TARGET_SCORE: 5,

  /** Maximum target score the host can set */
  MAX_TARGET_SCORE: 31,

  // ── Point categories (each worth exactly 1 pt) ──

  /** Each time a player clears the table by summing 15 */
  POINTS_PER_SCOPA: 1,

  /** Awarded to the player with the most cards in their captured pile */
  POINTS_MOST_CARDS: 1,

  /** Awarded to the player with the most Diamonds in their captured pile */
  POINTS_MOST_DIAMONDS: 1,

  /** Awarded to the player with the most Sevens in their captured pile */
  POINTS_MOST_SEVENS: 1,

  /** Awarded to the player holding the Seven of Diamonds */
  POINTS_SEVEN_OF_DIAMONDS: 1,

  /**
   * Draws in most-cards, most-diamonds, most-sevens award NO points.
   * Only a strict majority wins the point.
   */
  DRAW_AWARDS_NO_POINT: true,
} as const;

// ── Connection ────────────────────────────────

export const ConnectionConfig = {
  /** Seconds before a disconnected player slot is freed */
  DISCONNECT_TIMEOUT_SECONDS: 60,
  PING_INTERVAL_MS: 25_000,
  PING_TIMEOUT_MS:  10_000,
} as const;

// ── Helpers ───────────────────────────────────

/**
 * Returns how many dealing rounds fit for a given player count.
 * Throws if playerCount is outside the allowed range.
 */
export function totalDealsForPlayerCount(playerCount: number): number {
  if (playerCount < RoomConfig.MIN_PLAYERS || playerCount > RoomConfig.MAX_PLAYERS) {
    throw new Error(`Invalid player count: ${playerCount}`);
  }
  return DeckConfig.CARDS_FOR_PLAYERS / (playerCount * DeckConfig.INITIAL_HAND_SIZE);
}

// ── Convenience re-export ─────────────────────

export const GameConfig = {
  room:       RoomConfig,
  deck:       DeckConfig,
  turn:       TurnConfig,
  scoring:    ScoringConfig,
  connection: ConnectionConfig,
} as const;
