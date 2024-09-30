import { generateMapArray, Item, MapSize, Tile, TileTerrain } from './map';

describe('generateMapArray', () => {
    it('should generate a 10x10 map array filled with grass tiles', () => {
        const mapSize = MapSize.SMALL;
        const expectedTile: Tile = {
            terrain: TileTerrain.GRASS,
            item: Item.NONE,
        };

        const result = generateMapArray(mapSize, TileTerrain.GRASS);

        expect(result.length).toBe(mapSize * mapSize);
        result.forEach((tile) => {
            expect(tile).toEqual(expectedTile);
        });
    });

    it('should generate a 15x15 map array filled with Water tiles', () => {
        const mapSize = MapSize.MEDIUM;
        const expectedTile: Tile = {
            terrain: TileTerrain.WATER,
            item: Item.NONE,
        };

        const result = generateMapArray(mapSize, TileTerrain.WATER);

        expect(result.length).toBe(mapSize * mapSize);
        result.forEach((tile) => {
            expect(tile).toEqual(expectedTile);
        });
    });

    it('should generate a 20x20 map array filled with ice tiles', () => {
        const mapSize = MapSize.LARGE;
        const expectedTile: Tile = {
            terrain: TileTerrain.ICE,
            item: Item.NONE,
        };

        const result = generateMapArray(mapSize, TileTerrain.ICE);

        expect(result.length).toBe(mapSize * mapSize);
        result.forEach((tile) => {
            expect(tile).toEqual(expectedTile);
        });
    });
});
