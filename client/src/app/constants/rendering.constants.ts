export const FRAME_RATE = 60;
const MOVEMENT_DURATION = 0.5;
const IDLE_DURATION = 0.1;
export const MOVEMENT_FRAMES = FRAME_RATE * MOVEMENT_DURATION;
export const IDLE_FRAMES = FRAME_RATE * IDLE_DURATION;
const ONE_SECOND_MS = 1000;
export const FRAME_LENGTH = ONE_SECOND_MS / FRAME_RATE;

export const SPRITE_SHEET_WIDTH = 96;
export const SPRITE_SHEET_HEIGHT = 144;
export const SPRITES_PER_ROW = 3;
export const SPRITES_PER_COLUMN = 4;
export const SPRITE_WIDTH = SPRITE_SHEET_WIDTH / SPRITES_PER_ROW; // 32 pixels
export const SPRITE_HEIGHT = SPRITE_SHEET_HEIGHT / SPRITES_PER_COLUMN; // 36 pixels

export const MAP_PIXEL_DIMENSION = 1500;

export const TOTAL_TILE_SPRITES = 6;
export const TOTAL_ITEM_SPRITES = 9;
export const TOTAL_PLAYER_SPRITES = 12;

export const TILE_SPRITES_FOLDER = 'assets/tiles/';
export const ITEM_SPRITES_FOLDER = 'assets/items/';
export const PLAYER_SPRITES_FOLDER = 'assets/players/';

export const SPRITE_FILE_EXTENSION = '.png';

export const HOVER_STYLE = 'rgba(255, 255, 0, 0.5)';
export const REACHABLE_STYLE = 'rgba(0, 0, 255, 0.5)';
