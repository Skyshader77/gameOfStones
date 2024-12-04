import { MOCK_ROOM_ITEMS } from '@app/constants/item-test.constants';
import { MOCK_ROOM_GAMES, MOVEMENT_CONSTANTS } from '@app/constants/player.movement.test.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { MOCK_PLAYER_IN_GAME_ABANDONNED, MOCK_PLAYER_IN_GAME_NOT_ABANDONNED } from '@common/constants/test-players';
import { Avatar } from '@common/enums/avatar.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import {
    isAnotherPlayerPresentOnTile,
    isCoordinateWithinBoundaries,
    isItemOnTile,
    isPlayerOtherThanCurrentDefenderPresentOnTile,
    isTileUnavailable,
    isValidPosition,
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

describe('isCoordinateWithinBoundaries', () => {
    let map: TileTerrain[][];

    beforeEach(() => {
        map = [
            [TileTerrain.Grass, TileTerrain.Ice, TileTerrain.Water],
            [TileTerrain.Grass, TileTerrain.Wall, TileTerrain.ClosedDoor],
            [TileTerrain.Water, TileTerrain.Grass, TileTerrain.Ice],
        ];
    });

    it('should return false if the position is outside the map boundaries', () => {
        const outOfBoundsPositions: Vec2[] = [
            { x: -1, y: 1 },
            { x: 1, y: -1 },
            { x: 3, y: 1 },
            { x: 1, y: 3 },
        ];

        outOfBoundsPositions.forEach((position) => {
            expect(isCoordinateWithinBoundaries(position, map)).toBe(false);
        });
    });

    it('should return true if the position is within the map boundaries', () => {
        const validPosition: Vec2 = { x: 1, y: 1 };
        expect(isCoordinateWithinBoundaries(validPosition, map)).toBe(true);
    });
});

describe('isPlayerOtherThanCurrentDefenderPresentOnTile', () => {
    let players: Player[];
    let position: Vec2;

    beforeEach(() => {
        position = { x: 2, y: 3 };

        players = [
            {
                playerInfo: { userName: 'Player1', role: PlayerRole.Human, id: '1', avatar: Avatar.FemaleRanger },
                playerInGame: {
                    ...MOCK_PLAYER_IN_GAME_ABANDONNED,
                    currentPosition: { x: 2, y: 3 },
                    hasAbandoned: true,
                },
            },
            {
                playerInfo: { userName: 'Player2', role: PlayerRole.Human, id: '2', avatar: Avatar.MaleWarrior },
                playerInGame: {
                    ...MOCK_PLAYER_IN_GAME_NOT_ABANDONNED,
                    currentPosition: { x: 2, y: 3 },
                    hasAbandoned: false,
                },
            },
        ];
    });

    it('should return false if the only player on the tile is the defender', () => {
        const result = isPlayerOtherThanCurrentDefenderPresentOnTile(position, players, 'Player2');
        expect(result).toBe(false);
    });

    it('should return false if no players are on the tile', () => {
        const result = isPlayerOtherThanCurrentDefenderPresentOnTile({ x: 6, y: 7 }, players, 'Player1');
        expect(result).toBe(false);
    });

    it('should return true if another player (not the defender) is on the tile', () => {
        const result = isPlayerOtherThanCurrentDefenderPresentOnTile(position, players, 'Player1');
        expect(result).toBe(true);
    });
});

describe('isValidPosition', () => {
    let room: RoomGame;
    let position: Vec2;

    beforeEach(() => {
        const mapArray = [
            [TileTerrain.Grass, TileTerrain.Grass, TileTerrain.Grass, TileTerrain.Grass, TileTerrain.Grass],
            [TileTerrain.Grass, TileTerrain.Grass, TileTerrain.Grass, TileTerrain.Grass, TileTerrain.Grass],
            [TileTerrain.Grass, TileTerrain.Grass, TileTerrain.Grass, TileTerrain.Grass, TileTerrain.Grass],
            [TileTerrain.Grass, TileTerrain.Grass, TileTerrain.Grass, TileTerrain.Grass, TileTerrain.Grass],
            [TileTerrain.Grass, TileTerrain.Grass, TileTerrain.Grass, TileTerrain.Grass, TileTerrain.Grass],
        ];

        room = {
            game: {
                map: { mapArray, placedItems: [] },
            },
            players: [],
        } as RoomGame;
    });

    it('should return false if position is out of map boundaries', () => {
        position = { x: -1, y: 0 };
        const result = isValidPosition(position, room, false);
        expect(result).toBe(false);
    });

    it('should return false if position is beyond map dimensions', () => {
        position = { x: 10, y: 10 };
        const result = isValidPosition(position, room, false);
        expect(result).toBe(false);
    });
});

describe('isTileUnavailable', () => {
    let mapArray: TileTerrain[][];
    let playerList: Player[];

    beforeEach(() => {
        mapArray = [
            [TileTerrain.Grass, TileTerrain.Wall, TileTerrain.Grass],
            [TileTerrain.Grass, TileTerrain.ClosedDoor, TileTerrain.Grass],
            [TileTerrain.Ice, TileTerrain.Grass, TileTerrain.Grass],
        ];

        playerList = [
            {
                playerInfo: { userName: 'Player1', role: PlayerRole.Human, id: '1', avatar: Avatar.MaleMage },
                playerInGame: MOCK_PLAYER_IN_GAME_NOT_ABANDONNED,
            },
        ];
    });

    it('should return true if the tile is a wall', () => {
        const tilePosition: Vec2 = { x: 1, y: 0 };
        const result = isTileUnavailable(tilePosition, mapArray, playerList);
        expect(result).toBe(true);
    });

    it('should return true if the tile is a closed door', () => {
        const tilePosition: Vec2 = { x: 1, y: 1 };
        const result = isTileUnavailable(tilePosition, mapArray, playerList);
        expect(result).toBe(true);
    });

    it('should return false if the tile is free and valid', () => {
        const tilePosition: Vec2 = { x: 2, y: 2 };
        const result = isTileUnavailable(tilePosition, mapArray, playerList);
        expect(result).toBe(false);
    });
});
