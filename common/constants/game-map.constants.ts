import { GameMode } from '@common/enums/game-mode.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Map } from '@common/interfaces/map';

export const SMALL_MAP_ITEM_LIMIT = 2;
export const MEDIUM_MAP_ITEM_LIMIT = 4;
export const LARGE_MAP_ITEM_LIMIT = 6;

export const MAP_ITEM_LIMIT = {
    [MapSize.Small]: SMALL_MAP_ITEM_LIMIT,
    [MapSize.Medium]: MEDIUM_MAP_ITEM_LIMIT,
    [MapSize.Large]: LARGE_MAP_ITEM_LIMIT,
};

export const MINIMAL_PLAYER_CAPACITY = 2;
export const SMALL_MAP_PLAYER_CAPACITY = 2;
export const MEDIUM_MAP_PLAYER_CAPACITY = 4;
export const LARGE_MAP_PLAYER_CAPACITY = 6;

export const MAP_PLAYER_CAPACITY = {
    [MapSize.Small]: SMALL_MAP_PLAYER_CAPACITY,
    [MapSize.Medium]: MEDIUM_MAP_PLAYER_CAPACITY,
    [MapSize.Large]: LARGE_MAP_PLAYER_CAPACITY,
};

export const EMPTY_MAP: TileTerrain[][] = Array.from({ length: MapSize.Small }, () => Array.from({ length: MapSize.Small }, () => TileTerrain.Grass));

export const BLANK_MAP: Map = {
    size: MapSize.Small,
    mode: GameMode.Normal,
    mapArray: EMPTY_MAP,
    description: '',
    placedItems: [],
    imageData: '',
    isVisible: false,
    dateOfLastModification: new Date(),
    _id: '',
    name: 'OthmaneWorld',
};
