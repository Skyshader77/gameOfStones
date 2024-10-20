import { TileTerrain } from '@app/interfaces/tile-terrain';

export const IMPASSABLE_COST = Infinity;
export const TEN_PERCENT_CHANGE = 0.1;

export const TERRAIN_TO_COST_MAP: { [key in TileTerrain]: number } = {
    [TileTerrain.GRASS]: 1,
    [TileTerrain.ICE]: 0,
    [TileTerrain.WATER]: 2,
    [TileTerrain.CLOSEDDOOR]: IMPASSABLE_COST,
    [TileTerrain.WALL]: IMPASSABLE_COST,
    [TileTerrain.OPENDOOR]: 1,
};
