import { MOCK_ROOM_ITEMS, MOCK_ROOM_OFFENSIVE_DEFENSIVE_ITEMS } from '@app/constants/item-test.constants';
import { MOCK_ROOM_GAMES, MOVEMENT_CONSTANTS } from '@app/constants/player.movement.test.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { DEFENSIVE_ITEMS, OFFENSIVE_ITEMS } from '@common/enums/item-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Vec2 } from '@common/interfaces/vec2';
import {
    findNearestValidPosition,
    getAdjacentPositionsWithDiagonals,
    getNearestItemPosition,
    getNearestPlayerPosition,
    isAnotherPlayerPresentOnTile,
    isCoordinateWithinBoundaries,
    isItemOnTile,
    isValidTerrainForItem,
} from './utilities';

describe('isAnotherPlayerPresentOnTile', () => {
    it('should return true when another player is at x=1 and y=1', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        const newPosition: Vec2 = { x: 1, y: 1 };
        expect(isAnotherPlayerPresentOnTile(newPosition, room.players)).toBe(true);
    });

    it('should return false when current player is at x=0 and y=0', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.corridor)) as RoomGame;
        const newPosition: Vec2 = { x: 0, y: 0 };
        expect(isAnotherPlayerPresentOnTile(newPosition, room.players)).toBe(false);
    });

    it('should return false when no one is at x=2 and y=2', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        const newPosition: Vec2 = { x: 2, y: 2 };
        expect(isAnotherPlayerPresentOnTile(newPosition, room.players)).toBe(false);
    });
});

describe('isCoordinateWithinBoundaries', () => {
    it('should return false for an out of bounds negative position', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        expect(
            isCoordinateWithinBoundaries(
                { x: MOVEMENT_CONSTANTS.coords.invalidNegative, y: MOVEMENT_CONSTANTS.coords.invalidNegative },
                room.game.map.mapArray,
            ),
        ).toBe(false);
    });

    it('should return false for an out of bounds positive position', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        expect(
            isCoordinateWithinBoundaries(
                { x: MOVEMENT_CONSTANTS.coords.invalidPositive, y: MOVEMENT_CONSTANTS.coords.invalidPositive },
                room.game.map.mapArray,
            ),
        ).toBe(false);
    });

    it('should return true for a valid position', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
        expect(isCoordinateWithinBoundaries({ x: 0, y: 0 }, room.game.map.mapArray)).toBe(true);
    });
});

describe('getAdjacentPositions', () => {
    it('should return the correct adjacent positions for a given position', () => {
        const position: Vec2 = { x: 5, y: 5 };
        const expectedPositions: Vec2[] = [
            { x: 4, y: 4 },
            { x: 4, y: 5 },
            { x: 4, y: 6 },
            { x: 5, y: 4 },
            { x: 5, y: 6 },
            { x: 6, y: 4 },
            { x: 6, y: 5 },
            { x: 6, y: 6 },
        ];

        const actualPositions = getAdjacentPositionsWithDiagonals(position);

        expect(actualPositions).toEqual(expectedPositions);
    });
});

describe('isValidTerrainForItem', () => {
    it('should return true for valid terrain types', () => {
        const position: Vec2 = { x: 0, y: 0 };
        const mapArray = [[TileTerrain.Ice]];

        expect(isValidTerrainForItem(position, mapArray)).toBeTruthy();

        mapArray[0][0] = TileTerrain.Grass;
        expect(isValidTerrainForItem(position, mapArray)).toBeTruthy();

        mapArray[0][0] = TileTerrain.Water;
        expect(isValidTerrainForItem(position, mapArray)).toBeTruthy();
    });

    it('should return false for invalid terrain types', () => {
        const position: Vec2 = { x: 0, y: 0 };
        const mapArray = [[TileTerrain.Wall]];

        expect(isValidTerrainForItem(position, mapArray)).toBeFalsy();
    });
});

describe('isItemOnTile', () => {
    it('should return true when item exists on tile', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
        const mockMap = mockRoom.game.map;
        const position: Vec2 = { x: 1, y: 1 };

        const result = isItemOnTile(position, mockMap);
        expect(result).toBeTruthy();
    });

    it('should return false when no item exists on tile', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
        const mockMap = mockRoom.game.map;
        const position: Vec2 = { x: 0, y: 0 };

        const result = isItemOnTile(position, mockMap);
        expect(result).toBeFalsy();
    });
});

describe('findNearestValidPosition', () => {
    describe('when checking for free tiles (checkForItems: false)', () => {
        it('should not return the start position if it is invalid', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.corridor)) as RoomGame;
            const startPosition: Vec2 = { x: 0, y: 0 };

            const result = findNearestValidPosition({
                room,
                startPosition,
                checkForItems: false,
            });

            expect(result).not.toEqual(startPosition);
        });

        it('should not return position with another player', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers)) as RoomGame;
            const startPosition: Vec2 = { x: 1, y: 1 };

            const result = findNearestValidPosition({
                room,
                startPosition,
                checkForItems: false,
            });

            expect(result).not.toEqual(startPosition);
        });
    });

    describe('when checking for item placement (checkForItems: true)', () => {
        it('should return valid position for item placement', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
            const startPosition: Vec2 = { x: 0, y: 0 };

            const result = findNearestValidPosition({
                room,
                startPosition,
                checkForItems: true,
            });

            expect(result).toBeTruthy();
            expect(isValidTerrainForItem(result, room.game.map.mapArray)).toBe(true);
        });

        it('should not return position with existing item', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
            const itemPosition: Vec2 = { x: 1, y: 0 };
            const existingItemPosition: Vec2 = { x: 1, y: 1 };
            const result = findNearestValidPosition({
                room,
                startPosition: itemPosition,
                checkForItems: true,
            });

            expect(result).not.toEqual(existingItemPosition);
        });

        it('should not return position with existing player', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
            const itemPosition: Vec2 = { x: 1, y: 0 };
            const playerPosition: Vec2 = { x: 2, y: 0 };

            const result = findNearestValidPosition({
                room,
                startPosition: itemPosition,
                checkForItems: true,
            });

            expect(result).not.toEqual(playerPosition);
        });
    });

    describe('findNearestItemPosition', () => {
        it('should return the closest Item to the current player', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
            const startPosition: Vec2 = { x: 0, y: 0 };
            const result = getNearestItemPosition(room, startPosition);
            expect(result).toEqual({ cost: 2, position: { x: 1, y: 1 } });
        });
    });

    describe('findNearestPlayerPosition', () => {
        it('should return the closest player to the current player', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_ITEMS)) as RoomGame;
            const startPosition: Vec2 = { x: 0, y: 0 };
            const result = getNearestPlayerPosition(room, startPosition);
            expect(result).toEqual({ cost: 2, position: { x: 2, y: 0 } });
        });
    });

    describe('findNearestOffensiveItem', () => {
        it('should return the closest Offensive item to the current player', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_OFFENSIVE_DEFENSIVE_ITEMS)) as RoomGame;
            const startPosition: Vec2 = { x: 0, y: 0 };
            const result = getNearestItemPosition(room, startPosition, OFFENSIVE_ITEMS);
            expect(result).toEqual({ cost: 2, position: { x: 1, y: 1 } });
        });
    });

    describe('findNearestDefensiveItem', () => {
        it('should return the closest Defensive item to the current player', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_OFFENSIVE_DEFENSIVE_ITEMS)) as RoomGame;
            const startPosition: Vec2 = { x: 0, y: 0 };
            const result = getNearestItemPosition(room, startPosition, DEFENSIVE_ITEMS);
            expect(result.position).toEqual({ x: 2, y: 2 });
            expect(result.cost).toEqual(4);
        });
    });
});
