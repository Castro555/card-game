// ─────────────────────────────────────────────
//  gameConfig.ts
//  All tuneable game parameters in one place.
//  Change here → takes effect everywhere.
// ─────────────────────────────────────────────

// ── Room ─────────────────────────────────────

export const RoomConfig = {
  /** Minimum players required to start a game */
  MIN_PLAYERS: 2,

  /** Maximum players allowed per room */
  MAX_PLAYERS: 4,

  /** Length of the human-readable room code, e.g. "XK92" */
  ROOM_CODE_LENGTH: 4,

  /** Minutes of inactivity before an empty room is purged from Redis */
  ROOM_TTL_MINUTES: 120,

  /** Seconds the host has to start after all players are ready */
  START_TIMEOUT_SECONDS: 300,
} as const;

// ── Deck & hands ─────────────────────────────

export const DeckConfig = {
  /** Cards in a standard deck */
  TOTAL_CARDS: 40,

  /** Cards dealt to each player at round start */
  INITIAL_HAND_SIZE: 3,

  /** Maximum cards a player may hold at any time */
  MAX_HAND_SIZE: 3,
} as const;

// ── Turns & timing ────────────────────────────

export const TurnConfig = {
  /** Seconds before the server auto-skips an idle player */
  TURN_TIMEOUT_SECONDS: 30,

  /** Grace period (seconds) added after a reconnection */
  RECONNECT_GRACE_SECONDS: 15,

  /** Maximum consecutive skips before a player is kicked */
  MAX_CONSECUTIVE_SKIPS: 3,
} as const;

// ── Rounds & scoring ──────────────────────────

export const ScoringConfig = {
  /** Default number of rounds in a game */
  DEFAULT_TOTAL_ROUNDS: 3,

  /** Maximum rounds the host can configure */
  MAX_TOTAL_ROUNDS: 10,

  /** Points awarded per trick won */
  POINTS_PER_TRICK: 10,

  /** Bonus awarded for winning a full round */
  ROUND_WIN_BONUS: 50,

  /** Penalty deducted for being skipped due to timeout */
  TIMEOUT_PENALTY: -5,
} as const;

// ── Connection ────────────────────────────────

export const ConnectionConfig = {
  /** Seconds before a disconnected player is removed from the room */
  DISCONNECT_TIMEOUT_SECONDS: 60,

  /** Socket.io ping interval (ms) */
  PING_INTERVAL_MS: 25_000,

  /** Socket.io ping timeout (ms) */
  PING_TIMEOUT_MS: 10_000,
} as const;

// ── Convenience re-export ─────────────────────

export const GameConfig = {
  room:       RoomConfig,
  deck:       DeckConfig,
  turn:       TurnConfig,
  scoring:    ScoringConfig,
  connection: ConnectionConfig,
} as const;