// ─────────────────────────────────────────────
//  events.ts
//  Single source of truth for every Socket.io
//  event name. Always use these constants —
//  never raw strings — to catch typos at
//  compile time rather than at runtime.
// ─────────────────────────────────────────────

// ── Room ─────────────────────────────────────

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

// ── Game ──────────────────────────────────────

export const GameEvents = {
  // Client → Server
  Action:            "game:action",       // CaptureAction | LayAction

  // Server → Client
  Started:           "game:started",
  StateUpdate:       "game:stateUpdate",
  YourTurn:          "game:yourTurn",
  TurnSkipped:       "game:turnSkipped",
  NewDeal:           "game:newDeal",
  TableCardsAwarded: "game:tableCardsAwarded",
  Scored:            "game:scored",
  Ended:             "game:ended",
} as const;

// ── Player ────────────────────────────────────

export const PlayerEvents = {
  Reconnected:  "player:reconnected",
  Disconnected: "player:disconnected",
} as const;

// ── Chat ──────────────────────────────────────

export const ChatEvents = {
  Message: "chat:message",
} as const;

// ── System ────────────────────────────────────

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
