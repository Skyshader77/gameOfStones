import { MOCK_MOVEMENT } from '@app/constants/player.movement.test.constants';
import { Game } from '@app/interfaces/gameplay';
import { RoomGame } from '@app/interfaces/room-game';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { MovementServiceOutput } from '@common/interfaces/move';
import { Test, TestingModule } from '@nestjs/testing';
import { Subject } from 'rxjs';
import { VirtualPlayerStateService } from './virtual-player-state.service';

describe('VirtualPlayerStateService', () => {
    let service: VirtualPlayerStateService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [VirtualPlayerStateService],
        }).compile();

        service = module.get<VirtualPlayerStateService>(VirtualPlayerStateService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should initialize virtual player state if not already initialized', () => {
        const mockRoom = {
            game: {
                virtualState: {},
            },
        } as unknown as RoomGame;

        service.initializeVirtualPlayerState(mockRoom);

        expect(mockRoom.game.virtualState.aiTurnSubject).toBeDefined();
        expect(mockRoom.game.virtualState).toEqual(
            expect.objectContaining({
                obstacle: null,
                isSeekingPlayers: false,
                hasSlipped: false,
                justExitedFight: false,
                aiTurnSubject: expect.any(Subject),
                aiTurnSubscription: null,
            }),
        );
    });

    it('should set the correct initial state for a virtual player turn', () => {
        const mockRoom = {
            game: {
                virtualState: {
                    obstacle: 'obstacle',
                    isSeekingPlayers: false,
                    justExitedFight: true,
                },
            },
        } as unknown as RoomGame;

        service.initiateVirtualPlayerTurn(mockRoom);

        expect(mockRoom.game.virtualState).toEqual(
            expect.objectContaining({
                obstacle: null,
                isSeekingPlayers: true,
                justExitedFight: false,
            }),
        );
    });

    it('should update the virtual player state based on movement result', () => {
        const mockRoom = {
            game: {
                virtualState: {},
                hasPendingAction: true,
            },
        } as unknown as RoomGame;

        const expectedOutput: MovementServiceOutput = {
            optimalPath: MOCK_MOVEMENT.reachableTiles[0],
            hasTripped: false,
            isOnItem: false,
            interactiveObject: null,
        };

        const subjectSpy = jest.spyOn(service, 'getVirtualState').mockReturnValue(mockRoom.game.virtualState);
        service.initializeVirtualPlayerState(mockRoom);

        service.handleMovement(mockRoom, expectedOutput);

        expect(mockRoom.game.virtualState.obstacle).toBe(null);
        expect(mockRoom.game.hasPendingAction).toBe(true);
        expect(mockRoom.game.virtualState.aiTurnSubject).toBeDefined();
        subjectSpy.mockRestore();
    });

    it('should clear the obstacle if a new door is an open door', () => {
        const mockRoom = {
            game: {
                virtualState: { obstacle: { x: 1, y: 1 } },
            },
        } as unknown as RoomGame;

        service.handleDoor(mockRoom, TileTerrain.OpenDoor);

        expect(mockRoom.game.virtualState.obstacle).toBeNull();
    });

    it('should return true if there is an obstacle', () => {
        const mockRoom = {
            game: {
                virtualState: { obstacle: { x: 1, y: 1 } },
            },
        } as unknown as RoomGame;

        expect(service.isBeforeObstacle(mockRoom)).toBe(true);
    });

    // it('should return true if the player has slipped', () => {
    //     const mockRoom = {
    //         game: {
    //             virtualState: { hasSlipped: true },
    //         },
    //     } as unknown as RoomGame;

    //     expect(service.hasSlipped(mockRoom)).toBe(true);
    // });

    it('should set justExitedFight to true', () => {
        const mockGame = {
            virtualState: { justExitedFight: false },
        } as unknown as Game;

        service.setFightResult(mockGame);

        expect(mockGame.virtualState.justExitedFight).toBe(true);
    });

    it('should update isSeekingPlayers state', () => {
        const mockGame = {
            virtualState: { isSeekingPlayers: false },
        } as unknown as Game;

        service.setIsSeekingPlayers(mockGame, true);

        expect(mockGame.virtualState.isSeekingPlayers).toBe(true);
    });
});
