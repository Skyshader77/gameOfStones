/* eslint-disable @typescript-eslint/no-explicit-any */
import { SpecialItemService } from './special-item.service';
import { MOCK_ROOM_GAMES } from '@app/constants/player.movement.test.constants';
import { MapSize } from '@common/enums/map-size.enum';
import { BOMB_LARGE_MAP_RANGE, BOMB_MEDIUM_MAP_RANGE, BOMB_SMALL_MAP_RANGE } from '@app/constants/item.constants';
import { Vec2 } from '@common/interfaces/vec2';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { OverWorldActionType } from '@common/enums/overworld-action-type.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { RoomGame } from '@app/interfaces/room-game';

describe('SpecialItemService', () => {
    let service: SpecialItemService;
    let roomManagerService: RoomManagerService;

    beforeEach(() => {
        roomManagerService = {
            getCurrentRoomPlayer: jest.fn(),
        } as unknown as RoomManagerService;
        service = new SpecialItemService();
        (service as any).roomManagerService = roomManagerService;
    });

    describe('Bomb functionality', () => {
        describe('determineBombRange', () => {
            it('should return correct range for small map', () => {
                const result = service.determineBombRange(MapSize.Small);
                expect(result).toBe(BOMB_SMALL_MAP_RANGE);
            });

            it('should return correct range for medium map', () => {
                const result = service.determineBombRange(MapSize.Medium);
                expect(result).toBe(BOMB_MEDIUM_MAP_RANGE);
            });

            it('should return correct range for large map', () => {
                const result = service.determineBombRange(MapSize.Large);
                expect(result).toBe(BOMB_LARGE_MAP_RANGE);
            });
        });

        describe('isTileInBombRange', () => {
            const playerPosition: Vec2 = { x: 2, y: 2 };

            it('should return false for the tile where the player is standing', () => {
                const result = service.isTileInBombRange(playerPosition, playerPosition, MapSize.Small);
                expect(result).toBe(false);
            });

            it('should return true for tiles within range', () => {
                const tilePosition: Vec2 = { x: 2, y: 3 };
                const result = service.isTileInBombRange(playerPosition, tilePosition, MapSize.Small);
                expect(result).toBe(true);
            });

            it('should return false for tiles outside range', () => {
                const tilePosition: Vec2 = { x: 8, y: 8 };
                const result = service.isTileInBombRange(playerPosition, tilePosition, MapSize.Small);
                expect(result).toBe(false);
            });
        });

        describe('determineBombAffectedTiles', () => {
            it('should return correct affected tiles', () => {
                const playerPosition: Vec2 = { x: 1, y: 1 };
                const result = service.determineBombAffectedTiles(playerPosition, MOCK_ROOM_GAMES.multiplePlayers.game.map);

                expect(result.overWorldAction.action).toBe(OverWorldActionType.Bomb);
                expect(result.overWorldAction.position).toEqual(playerPosition);
                expect(result.affectedTiles.length).toBeGreaterThan(0);
                expect(result.affectedTiles).not.toContainEqual(playerPosition);
            });
        });

        describe('areAnyPlayersInBombRange', () => {
            it('should return true when players are in range', () => {
                const result = service.areAnyPlayersInBombRange(
                    { x: 0, y: 0 },
                    MOCK_ROOM_GAMES.multiplePlayers.game.map,
                    MOCK_ROOM_GAMES.multiplePlayers,
                );
                expect(result).toBe(true);
            });

            it('should return false when no players are in range', () => {
                const result = service.areAnyPlayersInBombRange({ x: 0, y: 0 }, MOCK_ROOM_GAMES.corridor.game.map, MOCK_ROOM_GAMES.corridor);
                expect(result).toBe(false);
            });
        });

        describe('handleBombUsed', () => {
            it('should mark current player as dead and return affected players', () => {
                const result = service.handleBombUsed(MOCK_ROOM_GAMES.multiplePlayers, { x: 0, y: 0 });
                expect(MOCK_ROOM_GAMES.multiplePlayers.game.isCurrentPlayerDead).toBe(true);
                expect(result.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Hammer functionality', () => {
        describe('handleHammerActionTiles', () => {
            it('should return correct actions for adjacent players', () => {
                const result = service.handleHammerActionTiles(MOCK_ROOM_GAMES.multiplePlayers.players[0], MOCK_ROOM_GAMES.multiplePlayers);
                expect(result.length).toBeGreaterThan(0);
                expect(result[0].overWorldAction.action).toBe(OverWorldActionType.Hammer);
            });

            it('should return empty array when no adjacent players', () => {
                const result = service.handleHammerActionTiles(MOCK_ROOM_GAMES.corridor.players[0], MOCK_ROOM_GAMES.corridor);
                expect(result).toHaveLength(0);
            });
        });

        describe('handleHammerUsed', () => {
            beforeEach(() => {
                (roomManagerService.getCurrentRoomPlayer as jest.Mock).mockReturnValue(MOCK_ROOM_GAMES.untrappedTwoPlayers.players[0]);
            });

            it('should return both initial hit player and final hit player when player is at slide end', () => {
                const mockRoom = {
                    ...MOCK_ROOM_GAMES.multiplePlayers,
                    players: [
                        { ...MOCK_ROOM_GAMES.multiplePlayers.players[0] },
                        {
                            ...MOCK_ROOM_GAMES.multiplePlayers.players[1],
                            playerInGame: {
                                ...MOCK_ROOM_GAMES.multiplePlayers.players[1].playerInGame,
                                currentPosition: { x: 1, y: 1 },
                            },
                        },
                        {
                            ...MOCK_ROOM_GAMES.multiplePlayers.players[2],
                            playerInGame: {
                                ...MOCK_ROOM_GAMES.multiplePlayers.players[2].playerInGame,
                                currentPosition: { x: 1, y: 2 },
                            },
                        },
                    ],
                };

                const result = service.handleHammerUsed(mockRoom, { x: 1, y: 1 });
                expect(result.length).toBe(2);
                expect(result[0]).toBeDefined();
                expect(result[1]).toBeDefined();
            });

            it('should return only initial hit player when no player at slide end', () => {
                const mockRoom = {
                    ...MOCK_ROOM_GAMES.multiplePlayers,
                    players: [
                        { ...MOCK_ROOM_GAMES.multiplePlayers.players[0] },
                        {
                            ...MOCK_ROOM_GAMES.multiplePlayers.players[1],
                            playerInGame: {
                                ...MOCK_ROOM_GAMES.multiplePlayers.players[1].playerInGame,
                                currentPosition: { x: 1, y: 1 },
                            },
                        },
                    ],
                };
                const result = service.handleHammerUsed(mockRoom, { x: 1, y: 1 });
                expect(result.length).toBe(1);
            });
        });

        describe('hammerSlide', () => {
            it('should stop slide when hitting wall', () => {
                const mockRoom: RoomGame = {
                    ...MOCK_ROOM_GAMES.weird,
                    game: {
                        ...MOCK_ROOM_GAMES.weird.game,
                        map: {
                            ...MOCK_ROOM_GAMES.weird.game.map,
                            size: MapSize.Small,
                            mapArray: [
                                [TileTerrain.Grass, TileTerrain.Wall],
                                [TileTerrain.Grass, TileTerrain.Grass],
                            ],
                        },
                    },
                };

                const startPosition: Vec2 = { x: 0, y: 0 };
                const directionVec: Vec2 = { x: 1, y: 0 }; // Moving right into the wall

                const result = (service as any).hammerSlide(mockRoom, startPosition, directionVec);

                const currentTile = { x: 1, y: 0 }; // This position contains the wall
                expect(mockRoom.game.map.mapArray[currentTile.y][currentTile.x]).toBe(TileTerrain.Wall);
                expect(result).toEqual([]); // Should be empty as we hit a wall
            });

            it('should correctly calculate slide path until obstacle', () => {
                const result = (service as any).hammerSlide(MOCK_ROOM_GAMES.multiplePlayers, { x: 1, y: 0 }, { x: 1, y: 1 });
                expect(result.length).toBeGreaterThan(0);
            });

            it('should return slide path when moving towards map edge', () => {
                const result = (service as any).hammerSlide(MOCK_ROOM_GAMES.multiplePlayers, { x: 0, y: 0 }, { x: -1, y: 0 });
                expect(result.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Helper methods', () => {
        describe('isTileAtEdgeOfMap', () => {
            const testMap = MOCK_ROOM_GAMES.multiplePlayers.game.map;

            it('should return true for left edge tile', () => {
                const result = (service as any).isTileAtEdgeOfMap(testMap, { x: 0, y: 2 });
                expect(result).toBe(true);
            });

            it('should return true for right edge tile', () => {
                const result = (service as any).isTileAtEdgeOfMap(testMap, { x: testMap.size - 1, y: 2 });
                expect(result).toBe(true);
            });

            it('should return true for top edge tile', () => {
                const result = (service as any).isTileAtEdgeOfMap(testMap, { x: 2, y: 0 });
                expect(result).toBe(true);
            });

            it('should return true for bottom edge tile', () => {
                const result = (service as any).isTileAtEdgeOfMap(testMap, { x: 2, y: testMap.size - 1 });
                expect(result).toBe(true);
            });

            it('should return false for center tile', () => {
                const result = (service as any).isTileAtEdgeOfMap(testMap, { x: 2, y: 2 });
                expect(result).toBe(false);
            });
        });

        describe('arePositionsEqual', () => {
            it('should return true for identical positions', () => {
                const pos1: Vec2 = { x: 1, y: 1 };
                const pos2: Vec2 = { x: 1, y: 1 };
                const result = (service as any).arePositionsEqual(pos1, pos2);
                expect(result).toBe(true);
            });

            it('should return false for different x coordinates', () => {
                const pos1: Vec2 = { x: 1, y: 1 };
                const pos2: Vec2 = { x: 2, y: 1 };
                const result = (service as any).arePositionsEqual(pos1, pos2);
                expect(result).toBe(false);
            });

            it('should return false for different y coordinates', () => {
                const pos1: Vec2 = { x: 1, y: 1 };
                const pos2: Vec2 = { x: 1, y: 2 };
                const result = (service as any).arePositionsEqual(pos1, pos2);
                expect(result).toBe(false);
            });

            it('should return false for completely different positions', () => {
                const pos1: Vec2 = { x: 1, y: 1 };
                const pos2: Vec2 = { x: 2, y: 2 };
                const result = (service as any).arePositionsEqual(pos1, pos2);
                expect(result).toBe(false);
            });
        });
    });
});
