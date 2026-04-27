// ─────────────────────────────────────────────
//  events.ts
//  Single source of truth for every Socket.io
//  event name. Use these constants instead of
//  raw strings to prevent typo-driven bugs.
// ─────────────────────────────────────────────

// ── Room events ───────────────────────────────

export const RoomEvents = {
  // Client → Server
  Create:       "room:create",
  Join:         "room:join",
  Leave:        "room:leave",
  Start:        "room:start",

  // Server → Client
  Updated:      "room:updated",
  PlayerJoined: "room:playerJoined",
  PlayerLeft:   "room:playerLeft",
} as const;

// ── Game events ───────────────────────────────

export const GameEvents = {
  // Client → Server
  PlayCard:   "game:playCard",
  DrawCard:   "game:drawCard",

  // Server → Client
  Started:    "game:started",
  StateUpdate:"game:stateUpdate",
  YourTurn:   "game:yourTurn",
  TurnSkipped:"game:turnSkipped",
  RoundEnded: "game:roundEnded",
  Ended:      "game:ended",
} as const;

// ── Player events ─────────────────────────────

export const PlayerEvents = {
  Reconnected:  "player:reconnected",
  Disconnected: "player:disconnected",
} as const;

// ── Chat events ───────────────────────────────

export const ChatEvents = {
  Message: "chat:message",
} as const;

// ── System events ─────────────────────────────

export const SystemEvents = {
  Error: "error",
  Ping:  "ping",
} as const;

// ── Flat map (useful for exhaustive checks) ───

export const SocketEvents = {
  ...RoomEvents,
  ...GameEvents,
  ...PlayerEvents,
  ...ChatEvents,
  ...SystemEvents,
} as const;

export type SocketEventName = typeof SocketEvents[keyof typeof SocketEvents];