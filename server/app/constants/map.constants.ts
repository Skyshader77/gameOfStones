import { TileTerrain } from '@common/enums/tile-terrain.enum';

export const IMPASSABLE_COST = Infinity;
export const TEN_PERCENT_CHANGE = 0.1;

export const TILE_COSTS: Record<TileTerrain, number> = {
    [TileTerrain.WALL]: Infinity,
    [TileTerrain.ICE]: 0,
    [TileTerrain.GRASS]: 1,
    [TileTerrain.CLOSEDDOOR]: Infinity,
    [TileTerrain.WATER]: 2,
    [TileTerrain.OPENDOOR]: 1,
};
