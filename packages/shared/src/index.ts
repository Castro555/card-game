// ─────────────────────────────────────────────
//  index.ts — public API of the shared package
//  Import from "@card-game/shared" in both
//  client and server.
// ─────────────────────────────────────────────

// Types
export * from "./types/card.types";
export * from "./types/player.types";
export * from "./types/room.types";
export * from "./types/game.types";
export * from "./types/socket.types";

// Constants
export * from "./constants/events";
export * from "./constants/gameConfig";

// Utils
export * from "./utils/cardUtils";
export * from "./utils/validations";