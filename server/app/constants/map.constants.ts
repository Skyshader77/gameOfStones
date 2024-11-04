import { TileTerrain } from '@common/enums/tile-terrain.enum';

export const IMPASSABLE_COST = Infinity;
export const TEN_PERCENT_CHANGE = 0.1;

export const TILE_COSTS: Record<TileTerrain, number> = {
    [TileTerrain.Wall]: Infinity,
    [TileTerrain.Ice]: 0,
    [TileTerrain.Grass]: 1,
    [TileTerrain.ClosedDoor]: Infinity,
    [TileTerrain.Water]: 2,
    [TileTerrain.OpenDoor]: 1,
};
