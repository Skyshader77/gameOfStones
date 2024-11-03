import { GameMode } from '@common/enums/game-mode.enum';
import { MapSize } from '@common/enums/map-size.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Map } from '@common/interfaces/map';

export const SMALL_MAP_ITEM_LIMIT = 2;
export const MEDIUM_MAP_ITEM_LIMIT = 4;
export const LARGE_MAP_ITEM_LIMIT = 6;

export const MAP_ITEM_LIMIT = {
    [MapSize.SMALL]: SMALL_MAP_ITEM_LIMIT,
    [MapSize.MEDIUM]: MEDIUM_MAP_ITEM_LIMIT,
    [MapSize.LARGE]: LARGE_MAP_ITEM_LIMIT,
};

export const MINIMAL_PLAYER_CAPACITY = 2;
export const SMALL_MAP_PLAYER_CAPACITY = 2;
export const MEDIUM_MAP_PLAYER_CAPACITY = 4;
export const LARGE_MAP_PLAYER_CAPACITY = 6;

export const MAP_PLAYER_CAPACITY = {
    [MapSize.SMALL]: SMALL_MAP_PLAYER_CAPACITY,
    [MapSize.MEDIUM]: MEDIUM_MAP_PLAYER_CAPACITY,
    [MapSize.LARGE]: LARGE_MAP_PLAYER_CAPACITY,
};

export const EMPTY_MAP =
    [
        [TileTerrain.GRASS, TileTerrain.GRASS, TileTerrain.GRASS],
        [TileTerrain.GRASS, TileTerrain.GRASS, TileTerrain.GRASS],
        [TileTerrain.GRASS, TileTerrain.GRASS, TileTerrain.GRASS],
    ]

export const BLANK_MAP: Map = {
    size: MapSize.SMALL,
    mode: GameMode.NORMAL,
    mapArray: EMPTY_MAP,
    description: '',
    placedItems: [],
    imageData: '',
    isVisible: false,
    dateOfLastModification: new Date,
    _id: '',
    name: 'OthmaneWorld'
}
