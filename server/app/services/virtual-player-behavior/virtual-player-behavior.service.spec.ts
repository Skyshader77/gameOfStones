/* eslint-disable max-lines */
import { MOCK_ROOM_ONE_PLAYER_LEFT_WITH_BOTS } from '@app/constants/gameplay.test.constants';
import { MOCK_ROOM_GAMES } from '@app/constants/player.movement.test.constants';
import {
    MOCK_AGGRESSIVE_VIRTUAL_PLAYER,
    MOCK_CLOSEST_OBJECT_DATA,
    MOCK_DEFENSIVE_VIRTUAL_PLAYER,
    MOCK_VIRTUAL_PLAYER_STATE,
} from '@app/constants/virtual-player-test.constants';
import { FightGateway } from '@app/gateways/fight/fight.gateway';
import { GameGateway } from '@app/gateways/game/game.gateway';
import { ClosestObjectData, VirtualPlayerState } from '@app/interfaces/ai-state';
import { RoomGame } from '@app/interfaces/room-game';
import { ErrorMessageService } from '@app/services/error-message/error-message.service';
import { SpecialItemService } from '@app/services/item/special-item/special-item.service';
import { PathFindingService } from '@app/services/pathfinding/pathfinding.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { VirtualPlayerHelperService } from '@app/services/virtual-player-helper/virtual-player-helper.service';
import { VirtualPlayerStateService } from '@app/services/virtual-player-state/virtual-player-state.service';
import { findPlayerAtPosition } from '@app/utils/utilities';
import { MOCK_PLAYER_IN_GAME } from '@common/constants/test-players';
import { Avatar } from '@common/enums/avatar.enum';
import { GameMode } from '@common/enums/game-mode.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { createStubInstance } from 'sinon';
import { VirtualPlayerBehaviorService } from './virtual-player-behavior.service';
import { MOCK_ROOM_GAME } from '@app/constants/test.constants';

describe('VirtualPlayerBehaviorService', () => {
    let service: VirtualPlayerBehaviorService;
    let roomManagerService: sinon.SinonStubbedInstance<RoomManagerService>;
    let gameGateway: sinon.SinonStubbedInstance<GameGateway>;
    let fightGateway: sinon.SinonStubbedInstance<FightGateway>;
    let helperService: sinon.SinonStubbedInstance<VirtualPlayerHelperService>;
    let stateService: sinon.SinonStubbedInstance<VirtualPlayerStateService>;
    let specialItemService: sinon.SinonStubbedInstance<SpecialItemService>;
    let mockAggressiveVirtualPlayer: Player;
    let pathfindingService: sinon.SinonStubbedInstance<PathFindingService>;
    let errorMessageService: sinon.SinonStubbedInstance<ErrorMessageService>;
    let pathFindingService: sinon.SinonStubbedInstance<PathFindingService>;
    let mockState: VirtualPlayerState;
    let mockRoom: RoomGame;

    beforeEach(async () => {
        roomManagerService = createStubInstance<RoomManagerService>(RoomManagerService);
        pathfindingService = createStubInstance<PathFindingService>(PathFindingService);
        gameGateway = createStubInstance<GameGateway>(GameGateway);
        fightGateway = createStubInstance<FightGateway>(FightGateway);
        helperService = createStubInstance<VirtualPlayerHelperService>(VirtualPlayerHelperService);
        stateService = createStubInstance<VirtualPlayerStateService>(VirtualPlayerStateService);
        errorMessageService = createStubInstance<ErrorMessageService>(ErrorMessageService);
        specialItemService = createStubInstance<SpecialItemService>(SpecialItemService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VirtualPlayerBehaviorService,
                { provide: RoomManagerService, useValue: roomManagerService },
                { provide: PathFindingService, useValue: pathfindingService },
                { provide: VirtualPlayerHelperService, useValue: helperService },
                { provide: VirtualPlayerStateService, useValue: stateService },
                { provide: ErrorMessageService, useValue: errorMessageService },
                { provide: SpecialItemService, useValue: specialItemService },
                { provide: FightGateway, useValue: fightGateway },
                { provide: GameGateway, useValue: gameGateway },
                { provide: PathFindingService, useValue: createStubInstance(PathFindingService) },
            ],
        }).compile();
        service = module.get<VirtualPlayerBehaviorService>(VirtualPlayerBehaviorService);
        mockAggressiveVirtualPlayer = JSON.parse(JSON.stringify(MOCK_AGGRESSIVE_VIRTUAL_PLAYER));
        mockState = JSON.parse(JSON.stringify(MOCK_VIRTUAL_PLAYER_STATE));
        mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ONE_PLAYER_LEFT_WITH_BOTS));
        mockState = JSON.parse(JSON.stringify(MOCK_VIRTUAL_PLAYER_STATE)) as VirtualPlayerState;
        stateService.getVirtualState.returns(mockState);
        pathFindingService = module.get(PathFindingService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('executeTurnAiPlayer', () => {
        it('should determineTurnAction after a random time', () => {
            const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAME)) as RoomGame;
            room.players[0].playerInfo.role = PlayerRole.AggressiveAI;

            const turnSpy = jest.spyOn(VirtualPlayerBehaviorService.prototype as any, 'determineTurnAction').mockImplementation();

            jest.useFakeTimers();

            service.executeTurnAIPlayer(room, room.players[0]);
            jest.runAllTimers();
            expect(turnSpy).toHaveBeenCalled();
        });
    });

    describe('defensiveTurnAction', () => {
        it('should prioritize defensive items when available', () => {
            const mockVirtualPlayer = {
                ...MOCK_DEFENSIVE_VIRTUAL_PLAYER,
                playerInfo: {
                    ...MOCK_DEFENSIVE_VIRTUAL_PLAYER.playerInfo,
                    role: PlayerRole.DefensiveAI,
                },
                playerInGame: {
                    ...MOCK_DEFENSIVE_VIRTUAL_PLAYER.playerInGame,
                    inventory: [ItemType.BismuthShield],
                },
            };

            mockRoom.players[0] = mockVirtualPlayer;

            stateService.getVirtualState.returns(MOCK_VIRTUAL_PLAYER_STATE);
            pathfindingService.getNearestItemPosition.returns(MOCK_CLOSEST_OBJECT_DATA.closestItem);

            service['determineTurnAction'](mockRoom, mockVirtualPlayer);
            sinon.assert.notCalled(gameGateway.endPlayerTurn);
        });

        it('should end turn if no valid actions are available', () => {
            const mockVirtualPlayer = {
                ...MOCK_DEFENSIVE_VIRTUAL_PLAYER,
                playerInGame: {
                    ...MOCK_DEFENSIVE_VIRTUAL_PLAYER.playerInGame,
                    inventory: [],
                    remainingMovement: 0,
                    remainingActions: 0,
                },
            };

            stateService.getVirtualState.returns(MOCK_VIRTUAL_PLAYER_STATE);
            pathFindingService.getNearestItemPosition.returns(null);
            pathFindingService.getNearestPlayerPosition.returns(null);

            service['determineTurnAction'](mockRoom, mockVirtualPlayer);

            sinon.assert.notCalled(gameGateway.endPlayerTurn);
        });
    });

    describe('offensiveTurnAction', () => {
        it('should end turn if no valid actions are available', () => {
            const mockVirtualPlayer = {
                ...MOCK_AGGRESSIVE_VIRTUAL_PLAYER,
                playerInGame: {
                    ...MOCK_AGGRESSIVE_VIRTUAL_PLAYER.playerInGame,
                    inventory: [],
                    remainingMovement: 0,
                    remainingActions: 0,
                },
            };

            stateService.getVirtualState.returns(MOCK_VIRTUAL_PLAYER_STATE);
            pathFindingService.getNearestItemPosition.returns(null);
            pathFindingService.getNearestPlayerPosition.returns(null);

            service['determineTurnAction'](mockRoom, mockVirtualPlayer);

            sinon.assert.notCalled(gameGateway.endPlayerTurn);
        });
    });

    describe('canFight', () => {
        it('should return true when player has actions and is next to opponent', () => {
            mockAggressiveVirtualPlayer.playerInGame.remainingActions = 1;
            expect(service['canFight'](mockAggressiveVirtualPlayer, MOCK_CLOSEST_OBJECT_DATA.closestPlayer.position)).toBeTruthy();
        });

        it('should return false when player has no actions', () => {
            mockAggressiveVirtualPlayer.playerInGame.remainingActions = 0;
            expect(service['canFight'](mockAggressiveVirtualPlayer, MOCK_CLOSEST_OBJECT_DATA.closestPlayer.position)).toBeFalsy();
        });

        it('should return false when opponent is not in fighting range', () => {
            mockAggressiveVirtualPlayer.playerInGame.remainingActions = 1;
            const farPlayerObjectData: ClosestObjectData = {
                ...MOCK_CLOSEST_OBJECT_DATA,
                closestPlayer: { position: { x: 2, y: 2 }, cost: 5 },
            };
            expect(service['canFight'](mockAggressiveVirtualPlayer, farPlayerObjectData.closestPlayer.position)).toBeFalsy();
        });

        describe('Bomb Strategy', () => {
            it('should use GeodeBomb when players are in range', () => {
                mockAggressiveVirtualPlayer.playerInGame.inventory = [ItemType.GeodeBomb];
                specialItemService.areAnyPlayersInBombRange.returns(true);

                const strategy = service['createBombStrategy'](mockAggressiveVirtualPlayer, mockRoom);
                const result = strategy();

                expect(result).toBeTruthy();
                expect(gameGateway.useSpecialItem.calledOnce).toBeTruthy();
            });

            it('should not use GeodeBomb when no players in range', () => {
                mockAggressiveVirtualPlayer.playerInGame.inventory = [ItemType.GeodeBomb];
                specialItemService.areAnyPlayersInBombRange.returns(false);

                const strategy = service['createBombStrategy'](mockAggressiveVirtualPlayer, mockRoom);
                const result = strategy();

                expect(result).toBeFalsy();
                expect(gameGateway.useSpecialItem.called).toBeFalsy();
            });

            it('should not use GeodeBomb when no bomb in inventory', () => {
                mockAggressiveVirtualPlayer.playerInGame.inventory = [];
                specialItemService.areAnyPlayersInBombRange.returns(true);

                const strategy = service['createBombStrategy'](mockAggressiveVirtualPlayer, mockRoom);
                const result = strategy();

                expect(result).toBeFalsy();
                expect(gameGateway.useSpecialItem.called).toBeFalsy();
            });
        });

        describe('Hammer Strategy', () => {
            it('should use GraniteHammer when next to player', () => {
                mockAggressiveVirtualPlayer.playerInGame.inventory = [ItemType.GraniteHammer];
                mockAggressiveVirtualPlayer.playerInGame.currentPosition = { x: 0, y: 0 };

                const closestObjectData = {
                    closestItem: { position: { x: 1, y: 0 }, cost: 1 },
                    closestPlayer: {
                        position: { x: 1, y: 0 },
                        cost: 1,
                    },
                };

                const strategy = service['createHammerStrategy'](mockAggressiveVirtualPlayer, closestObjectData, mockRoom);
                const result = strategy();

                expect(result).toBeTruthy();
                expect(gameGateway.useSpecialItem.calledOnce).toBeTruthy();
            });

            it('should not use GraniteHammer when not next to player', () => {
                mockAggressiveVirtualPlayer.playerInGame.inventory = [ItemType.GraniteHammer];
                mockAggressiveVirtualPlayer.playerInGame.currentPosition = { x: 0, y: 0 };

                const closestObjectData = {
                    closestItem: { position: { x: 1, y: 0 }, cost: 1 },
                    closestPlayer: {
                        position: { x: 2, y: 2 },
                        cost: 1,
                    },
                };

                const strategy = service['createHammerStrategy'](mockAggressiveVirtualPlayer, closestObjectData, mockRoom);
                const result = strategy();

                expect(result).toBeFalsy();
                expect(gameGateway.useSpecialItem.called).toBeFalsy();
            });

            it('should not use GraniteHammer when no hammer in inventory', () => {
                mockAggressiveVirtualPlayer.playerInGame.inventory = [];
                mockAggressiveVirtualPlayer.playerInGame.currentPosition = { x: 0, y: 0 };

                const closestObjectData = {
                    closestItem: { position: { x: 1, y: 0 }, cost: 1 },
                    closestPlayer: {
                        position: { x: 1, y: 0 },
                        cost: 1,
                    },
                };

                const strategy = service['createHammerStrategy'](mockAggressiveVirtualPlayer, closestObjectData, mockRoom);
                const result = strategy();

                expect(result).toBeFalsy();
                expect(gameGateway.useSpecialItem.called).toBeFalsy();
            });
        });

        describe('Forced Fight Strategy', () => {
            it('should not initiate fight when player does not have to fight', () => {
                mockState.obstacle = null;
                mockAggressiveVirtualPlayer.playerInGame.remainingActions = 1;

                const closestObjectData = {
                    closestItem: { position: { x: 1, y: 0 }, cost: 1 },
                    closestPlayer: {
                        position: { x: 1, y: 0 },
                        cost: 1,
                    },
                };

                const strategy = service['createForcedFightStrategy'](mockAggressiveVirtualPlayer, closestObjectData, mockRoom);
                const result = strategy();

                expect(result).toBeFalsy();
                expect(fightGateway.startFight.called).toBeFalsy();
            });
        });

        describe('Door Strategy', () => {
            it('should open door when player has an obstacle and actions', () => {
                mockState.obstacle = { x: 1, y: 1 };
                mockAggressiveVirtualPlayer.playerInGame.remainingActions = 1;

                const strategy = service['createDoorStrategy'](mockAggressiveVirtualPlayer, mockRoom);
                const result = strategy();

                expect(result).toBeTruthy();
                expect(gameGateway.togglePlayerDoor.calledOnceWith(mockRoom, mockState.obstacle)).toBeTruthy();
            });

            it('should not open door when no obstacle', () => {
                mockState.obstacle = null;
                mockAggressiveVirtualPlayer.playerInGame.remainingActions = 1;

                const strategy = service['createDoorStrategy'](mockAggressiveVirtualPlayer, mockRoom);
                const result = strategy();

                expect(result).toBeFalsy();
                expect(gameGateway.togglePlayerDoor.called).toBeFalsy();
            });

            it('should not open door when no remaining actions', () => {
                mockState.obstacle = { x: 1, y: 1 };
                mockAggressiveVirtualPlayer.playerInGame.remainingActions = 0;

                const strategy = service['createDoorStrategy'](mockAggressiveVirtualPlayer, mockRoom);
                const result = strategy();

                expect(result).toBeFalsy();
                expect(gameGateway.togglePlayerDoor.called).toBeFalsy();
            });
        });

        describe('Flag Strategy', () => {
            it('should move to starting position when flag is held in CTF mode', () => {
                mockRoom.game.mode = GameMode.CTF;
                mockAggressiveVirtualPlayer.playerInGame.inventory = [ItemType.Flag];
                stateService.setIsSeekingPlayers.reset();
                gameGateway.sendMove.reset();

                const strategy = service['createFlagStrategy'](mockAggressiveVirtualPlayer, mockRoom);
                const result = strategy();

                expect(result).toBeTruthy();
                expect(stateService.setIsSeekingPlayers.calledOnceWith(mockRoom.game, true)).toBeTruthy();
                expect(gameGateway.sendMove.calledOnceWith(mockRoom, mockAggressiveVirtualPlayer.playerInGame.startPosition)).toBeTruthy();
            });

            it('should not move when not in CTF mode', () => {
                mockRoom.game.mode = GameMode.Normal;
                mockAggressiveVirtualPlayer.playerInGame.inventory = [ItemType.Flag];
                stateService.setIsSeekingPlayers.reset();
                gameGateway.sendMove.reset();

                const strategy = service['createFlagStrategy'](mockAggressiveVirtualPlayer, mockRoom);
                const result = strategy();

                expect(result).toBeFalsy();
                expect(stateService.setIsSeekingPlayers.called).toBeFalsy();
                expect(gameGateway.sendMove.called).toBeFalsy();
            });

            it('should not move when no flag is held', () => {
                mockRoom.game.mode = GameMode.CTF;
                mockAggressiveVirtualPlayer.playerInGame.inventory = [];
                stateService.setIsSeekingPlayers.reset();
                gameGateway.sendMove.reset();

                const strategy = service['createFlagStrategy'](mockAggressiveVirtualPlayer, mockRoom);
                const result = strategy();

                expect(result).toBeFalsy();
                expect(stateService.setIsSeekingPlayers.called).toBeFalsy();
                expect(gameGateway.sendMove.called).toBeFalsy();
            });
        });

        describe('isFightAvailable', () => {
            it('should return true when opponent is adjacent horizontally', () => {
                const result = service['isNextToOtherPlayer']({ x: 1, y: 0 }, { x: 0, y: 0 });
                expect(result).toBeTruthy();
            });

            it('should return true when opponent is adjacent vertically', () => {
                const result = service['isNextToOtherPlayer']({ x: 0, y: 1 }, { x: 0, y: 0 });
                expect(result).toBeTruthy();
            });

            it('should return false when opponent is diagonal', () => {
                const result = service['isNextToOtherPlayer']({ x: 1, y: 1 }, { x: 0, y: 0 });
                expect(result).toBeFalsy();
            });

            it('should return false when opponent is too far', () => {
                const result = service['isNextToOtherPlayer']({ x: 2, y: 0 }, { x: 0, y: 0 });
                expect(result).toBeFalsy();
            });
        });

        describe('hasBomb', () => {
            it('should return true when player has a GeodeBomb', () => {
                mockAggressiveVirtualPlayer.playerInGame.inventory = [ItemType.GeodeBomb];
                const result = service['hasBomb'](mockAggressiveVirtualPlayer);
                expect(result).toBeTruthy();
            });

            it('should return false when player does not have a GeodeBomb', () => {
                mockAggressiveVirtualPlayer.playerInGame.inventory = [];
                const result = service['hasBomb'](mockAggressiveVirtualPlayer);
                expect(result).toBeFalsy();
            });
        });

        describe('hasHammer', () => {
            it('should return true when player has a GraniteHammer', () => {
                mockAggressiveVirtualPlayer.playerInGame.inventory = [ItemType.GraniteHammer];
                const result = service['hasHammer'](mockAggressiveVirtualPlayer);
                expect(result).toBeTruthy();
            });

            it('should return false when player does not have a GraniteHammer', () => {
                mockAggressiveVirtualPlayer.playerInGame.inventory = [];
                const result = service['hasHammer'](mockAggressiveVirtualPlayer);
                expect(result).toBeFalsy();
            });
        });

        describe('hasFlag', () => {
            it('should return true when player has a flag in CTF mode', () => {
                mockRoom.game.mode = GameMode.CTF;
                mockAggressiveVirtualPlayer.playerInGame.inventory = [ItemType.Flag];
                const result = service['hasFlag'](mockAggressiveVirtualPlayer, mockRoom);
                expect(result).toBeTruthy();
            });

            it('should return false when player does not have a flag', () => {
                mockRoom.game.mode = GameMode.CTF;
                mockAggressiveVirtualPlayer.playerInGame.inventory = [];
                const result = service['hasFlag'](mockAggressiveVirtualPlayer, mockRoom);
                expect(result).toBeFalsy();
            });

            it('should return false when not in CTF mode', () => {
                mockRoom.game.mode = GameMode.Normal;
                mockAggressiveVirtualPlayer.playerInGame.inventory = [ItemType.Flag];
                const result = service['hasFlag'](mockAggressiveVirtualPlayer, mockRoom);
                expect(result).toBeFalsy();
            });
        });

        describe('Blocking and Obstacle Methods', () => {
            describe('isBlocked', () => {
                it('should return true when player has an obstacle and no remaining actions', () => {
                    mockState.obstacle = { x: 1, y: 1 };
                    mockAggressiveVirtualPlayer.playerInGame.remainingActions = 0;
                    const result = service['isBlocked'](mockAggressiveVirtualPlayer, mockState);
                    expect(result).toBeTruthy();
                });

                it('should return false when player has no obstacle', () => {
                    mockState.obstacle = null;
                    mockAggressiveVirtualPlayer.playerInGame.remainingActions = 0;
                    const result = service['isBlocked'](mockAggressiveVirtualPlayer, mockState);
                    expect(result).toBeFalsy();
                });

                it('should return false when player has remaining actions', () => {
                    mockState.obstacle = { x: 1, y: 1 };
                    mockAggressiveVirtualPlayer.playerInGame.remainingActions = 1;
                    const result = service['isBlocked'](mockAggressiveVirtualPlayer, mockState);
                    expect(result).toBeFalsy();
                });
            });

            describe('shouldOpenDoor', () => {
                it('should return true when player has an obstacle and remaining actions', () => {
                    mockState.obstacle = { x: 1, y: 1 };
                    mockAggressiveVirtualPlayer.playerInGame.remainingActions = 1;
                    const result = service['shouldOpenDoor'](mockAggressiveVirtualPlayer, mockState);
                    expect(result).toBeTruthy();
                });

                it('should return false when player has no obstacle', () => {
                    mockState.obstacle = null;
                    mockAggressiveVirtualPlayer.playerInGame.remainingActions = 1;
                    const result = service['shouldOpenDoor'](mockAggressiveVirtualPlayer, mockState);
                    expect(result).toBeFalsy();
                });

                it('should return false when player has no remaining actions', () => {
                    mockState.obstacle = { x: 1, y: 1 };
                    mockAggressiveVirtualPlayer.playerInGame.remainingActions = 0;
                    const result = service['shouldOpenDoor'](mockAggressiveVirtualPlayer, mockState);
                    expect(result).toBeFalsy();
                });
            });
        });

        describe('doesClosestItemExist', () => {
            it('should return true when item has a position', () => {
                const closestItem = { position: { x: 1, y: 1 }, cost: 1 };
                const result = service['doesClosestItemExist'](closestItem);
                expect(result).toBeTruthy();
            });

            it('should return false when item has no position', () => {
                const closestItem = { position: null, cost: 1 };
                const result = service['doesClosestItemExist'](closestItem);
                expect(result).toBeFalsy();
            });
        });
    });

    describe('createFightStrategy', () => {
        it('should return false when not next to player', () => {
            const mockVirtualPlayer = {
                ...MOCK_AGGRESSIVE_VIRTUAL_PLAYER,
                playerInGame: {
                    ...MOCK_AGGRESSIVE_VIRTUAL_PLAYER.playerInGame,
                    remainingActions: 1,
                    currentPosition: { x: 1, y: 1 },
                },
            };
            const mockClosestObjectData = {
                ...MOCK_CLOSEST_OBJECT_DATA,
                closestPlayer: { position: { x: 2, y: 2 }, cost: 0 },
            };
            const mockVirtualPlayerState = { ...MOCK_VIRTUAL_PLAYER_STATE };
            const strategy = service['createFightStrategy'](mockVirtualPlayer, mockClosestObjectData, mockRoom);

            const result = strategy();

            expect(result).toBe(false);
            sinon.assert.notCalled(fightGateway.startFight);
        });
    });

    describe('createMoveToPlayerStrategy', () => {
        it('should return true and move towards player when not blocked', () => {
            const mockVirtualPlayer = {
                ...MOCK_AGGRESSIVE_VIRTUAL_PLAYER,
                playerInGame: {
                    ...MOCK_AGGRESSIVE_VIRTUAL_PLAYER.playerInGame,
                    currentPosition: { x: 1, y: 1 },
                },
            };
            const mockClosestObjectData = {
                ...MOCK_CLOSEST_OBJECT_DATA,
                closestPlayer: { position: { x: 3, y: 3 }, cost: 0 },
            };
            const mockVirtualPlayerState = {
                ...MOCK_VIRTUAL_PLAYER_STATE,
                obstacle: null,
            };

            const strategy = service['createMoveToPlayerStrategy'](mockVirtualPlayer, mockClosestObjectData, mockRoom);

            const result = strategy();

            expect(result).toBe(true);
            sinon.assert.calledWith(gameGateway.sendMove, mockRoom, mockClosestObjectData.closestPlayer.position);
            sinon.assert.called(stateService.setIsSeekingPlayers);
        });

        it('should return false when already next to player', () => {
            const mockVirtualPlayer = {
                ...MOCK_AGGRESSIVE_VIRTUAL_PLAYER,
                playerInGame: {
                    ...MOCK_AGGRESSIVE_VIRTUAL_PLAYER.playerInGame,
                    currentPosition: { x: 1, y: 1 },
                },
            };
            const mockClosestObjectData = {
                ...MOCK_CLOSEST_OBJECT_DATA,
                closestPlayer: { position: { x: 1, y: 2 }, cost: 0 },
            };
            const mockVirtualPlayerState = {
                ...MOCK_VIRTUAL_PLAYER_STATE,
                obstacle: null,
            };

            const strategy = service['createMoveToPlayerStrategy'](mockVirtualPlayer, mockClosestObjectData, mockRoom);

            const result = strategy();
            expect(result).toBe(false);
            sinon.assert.notCalled(gameGateway.sendMove);
            sinon.assert.notCalled(stateService.setIsSeekingPlayers);
        });
    });

    describe('findPlayerAtPosition', () => {
        const room = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers));

        it('should find player at given position', () => {
            const position: Vec2 = { x: 0, y: 0 };
            const result = findPlayerAtPosition(position, room);
            expect(result).toEqual({
                playerInfo: {
                    id: '1',
                    userName: 'Player1',
                    avatar: Avatar.MaleNinja,
                    role: PlayerRole.Human,
                },
                playerInGame: {
                    ...MOCK_PLAYER_IN_GAME,
                    currentPosition: position,
                    startPosition: position,
                },
            });
        });

        it('should return null when no player at position', () => {
            const position: Vec2 = { x: 9, y: 9 };
            const result = findPlayerAtPosition(position, room);
            expect(result).toBeNull();
        });
    });

    describe('Additional Methods Tests', () => {
        // describe('isClosestPlayerReachable', () => {
        //     it('should return true when player has enough movement', () => {
        //         mockAggressiveVirtualPlayer.playerInGame.remainingMovement = 5;
        //         const closestPlayer = { position: { x: 1, y: 1 }, cost: 4 };
        //         const result = service['isClosestPlayerReachable'](mockAggressiveVirtualPlayer, closestPlayer);
        //         expect(result).toBeTruthy();
        //     });

        //     it('should return false when player does not have enough movement', () => {
        //         mockAggressiveVirtualPlayer.playerInGame.remainingMovement = 3;
        //         const closestPlayer = { position: { x: 1, y: 1 }, cost: 4 };
        //         const result = service['isClosestPlayerReachable'](mockAggressiveVirtualPlayer, closestPlayer);
        //         expect(result).toBeFalsy();
        //     });
        // });

        // describe('isClosestOffensiveItemReachable', () => {
        //     it('should return true when player has enough movement', () => {
        //         mockAggressiveVirtualPlayer.playerInGame.remainingMovement = 5;
        //         const closestItem = { position: { x: 1, y: 1 }, cost: 4 };
        //         const result = service['isClosestOffensiveItemReachable'](mockAggressiveVirtualPlayer, closestItem);
        //         expect(result).toBeTruthy();
        //     });

        //     it('should return false when player does not have enough movement', () => {
        //         mockAggressiveVirtualPlayer.playerInGame.remainingMovement = 3;
        //         const closestItem = { position: { x: 1, y: 1 }, cost: 4 };
        //         const result = service['isClosestOffensiveItemReachable'](mockAggressiveVirtualPlayer, closestItem);
        //         expect(result).toBeFalsy();
        //     });
        // });

        describe('hasToFight', () => {
            it('should return true when player has obstacle and can fight', () => {
                mockState.obstacle = { x: 1, y: 1 };
                mockAggressiveVirtualPlayer.playerInGame.remainingActions = 1;
                const result = service['hasToFight'](mockAggressiveVirtualPlayer, MOCK_CLOSEST_OBJECT_DATA.closestPlayer.position, mockState);
                expect(result).toBeTruthy();
            });

            it('should return false when player has no obstacle', () => {
                mockState.obstacle = null;
                mockAggressiveVirtualPlayer.playerInGame.remainingActions = 1;
                const result = service['hasToFight'](mockAggressiveVirtualPlayer, MOCK_CLOSEST_OBJECT_DATA.closestPlayer.position, mockState);
                expect(result).toBeFalsy();
            });

            it('should return false when player cannot fight', () => {
                mockState.obstacle = { x: 1, y: 1 };
                mockAggressiveVirtualPlayer.playerInGame.remainingActions = 0;
                const result = service['hasToFight'](mockAggressiveVirtualPlayer, MOCK_CLOSEST_OBJECT_DATA.closestPlayer.position, mockState);
                expect(result).toBeFalsy();
            });
        });

        describe('Strategies', () => {
            // describe('createOffensiveItemStrategy', () => {
            //     it('should return a strategy that returns true when offensive item is reachable', () => {
            //         const closestOffensiveItem = { position: { x: 1, y: 1 }, cost: 4 };
            //         mockAggressiveVirtualPlayer.playerInGame.remainingMovement = 5;

            //         const strategy = service['createOffensiveItemStrategy'](mockAggressiveVirtualPlayer, closestOffensiveItem, mockRoom);

            //         gameGateway.sendMove.reset();
            //         const result = strategy();

            //         expect(result).toBeTruthy();
            //         expect(gameGateway.sendMove.calledOnceWith(mockRoom, closestOffensiveItem.position)).toBeTruthy();
            //     });

            //     it('should return a strategy that returns false when offensive item is not reachable', () => {
            //         const closestOffensiveItem = { position: { x: 1, y: 1 }, cost: 4 };
            //         mockAggressiveVirtualPlayer.playerInGame.remainingMovement = 3;

            //         const strategy = service['createOffensiveItemStrategy'](mockAggressiveVirtualPlayer, closestOffensiveItem, mockRoom);

            //         gameGateway.sendMove.reset();
            //         const result = strategy();

            //         expect(result).toBeFalsy();
            //         expect(gameGateway.sendMove.called).toBeFalsy();
            //     });
            // });

            describe('createAlternateMoveToPlayerStrategy', () => {
                it('should return a strategy that returns true when player is not next to closest player', () => {
                    const closestObjectData = {
                        closestPlayer: {
                            position: { x: 2, y: 2 },
                            cost: 4,
                        },
                    };
                    mockAggressiveVirtualPlayer.playerInGame.currentPosition = { x: 0, y: 0 };

                    const strategy = service['createAlternateMoveToPlayerStrategy'](
                        mockAggressiveVirtualPlayer,
                        closestObjectData as ClosestObjectData,
                        mockRoom,
                    );

                    stateService.setIsSeekingPlayers.reset();
                    gameGateway.sendMove.reset();
                    const result = strategy();

                    expect(result).toBeTruthy();
                    expect(stateService.setIsSeekingPlayers.calledOnceWith(mockRoom.game, true)).toBeTruthy();
                    expect(gameGateway.sendMove.calledOnceWith(mockRoom, closestObjectData.closestPlayer.position)).toBeTruthy();
                });

                it('should return a strategy that returns false when player is next to closest player', () => {
                    const closestObjectData = {
                        closestPlayer: {
                            position: { x: 1, y: 0 },
                            cost: 4,
                        },
                    };
                    mockAggressiveVirtualPlayer.playerInGame.currentPosition = { x: 0, y: 0 };

                    const strategy = service['createAlternateMoveToPlayerStrategy'](
                        mockAggressiveVirtualPlayer,
                        closestObjectData as ClosestObjectData,
                        mockRoom,
                    );

                    stateService.setIsSeekingPlayers.reset();
                    gameGateway.sendMove.reset();
                    const result = strategy();

                    expect(result).toBeFalsy();
                    expect(stateService.setIsSeekingPlayers.called).toBeFalsy();
                    expect(gameGateway.sendMove.called).toBeFalsy();
                });

                it('should set up AI turn subscription if not already exists', () => {
                    service.initializeRoomForVirtualPlayers(MOCK_ROOM_GAME);
                    expect(mockRoom.game.virtualState.aiTurnSubscription).toBeDefined();
                  });
            });
        });
    });
});
