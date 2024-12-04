import { TileTerrain } from '@common/enums/tile-terrain.enum';

export const TILE_COSTS: Record<TileTerrain, number> = {
    [TileTerrain.Wall]: Infinity,
    [TileTerrain.Ice]: 0,
    [TileTerrain.Grass]: 1,
    [TileTerrain.ClosedDoor]: Infinity,
    [TileTerrain.Water]: 2,
    [TileTerrain.OpenDoor]: 1,
};

export const TILE_COSTS_AI: Record<TileTerrain, number> = {
    [TileTerrain.Wall]: Infinity,
    [TileTerrain.Ice]: 0,
    [TileTerrain.Grass]: 1,
    [TileTerrain.ClosedDoor]: 1,
    [TileTerrain.Water]: 2,
    [TileTerrain.OpenDoor]: 1,
};
