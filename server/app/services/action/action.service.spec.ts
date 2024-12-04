/* eslint-disable @typescript-eslint/no-explicit-any */
import { MOCK_ROOM_GAMES } from '@app/constants/player.movement.test.constants';
import { DoorOpeningService } from '@app/services/door-opening/door-opening.service';
import { OverWorldActionType } from '@common/enums/overworld-action-type.enum';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { createStubInstance } from 'sinon';
import { ActionService } from './action.service';

describe('ActionService', () => {
    let service: ActionService;
    let doorOpeningService: sinon.SinonStubbedInstance<DoorOpeningService>;

    beforeEach(async () => {
        doorOpeningService = createStubInstance<DoorOpeningService>(DoorOpeningService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [ActionService, { provide: DoorOpeningService, useValue: doorOpeningService }],
        }).compile();

        service = module.get<ActionService>(ActionService);
    });

    describe('hasNoPossibleAction', () => {
        it('should return true when no remaining actions', () => {
            const mockRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.corridor));
            const player = mockRoomGame.players[0];
            player.playerInGame.remainingActions = 0;

            const result = service.hasNoPossibleAction(mockRoomGame, player);
            expect(result).toBeTruthy();
        });

        it('should return true when not next to action tile', () => {
            const mockRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.corridor));

            const player = {
                ...mockRoomGame.players[0],
                playerInGame: {
                    ...mockRoomGame.players[0].playerInGame,
                    currentPosition: { x: 1, y: 0 },
                    remainingActions: 1,
                },
            };

            doorOpeningService.isTileDoor.returns(false);

            const result = service.hasNoPossibleAction(mockRoomGame, player);
            expect(result).toBeTruthy();
        });

        it('should return false when has remaining actions and is next to action tile', () => {
            const mockRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.untrapped));
            const player = mockRoomGame.players[0];
            player.playerInGame.remainingActions = 1;

            doorOpeningService.isTileDoor.returns(true);

            const result = service.hasNoPossibleAction(mockRoomGame, player);
            expect(result).toBeFalsy();
        });
    });

    describe('isNextToActionTile', () => {
        it('should return true when next to a door', () => {
            const mockRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.trapped));
            const player = mockRoomGame.players[0];
            player.currentPosition = { x: 1, y: 0 };
            doorOpeningService.isTileDoor.returns(true);

            const result = service.isNextToActionTile(mockRoomGame, player);
            expect(result).toBeTruthy();
        });

        it('should return true when next to another player', () => {
            const mockRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers));
            const player = mockRoomGame.players[0];

            const result = service.isNextToActionTile(mockRoomGame, player);
            expect(result).toBeTruthy();
        });
    });

    describe('getOverWorldActions', () => {
        it('should return no actions when no remaining actions', () => {
            const mockRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.corridor));
            const player = mockRoomGame.players[0];
            player.playerInGame.remainingActions = 0;

            const actions = service.getOverWorldActions(player, mockRoomGame);
            expect(actions).toHaveLength(0);
        });

        it('should return fight action when another player is adjacent', () => {
            const mockRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers));
            const player = mockRoomGame.players[0];
            player.playerInGame.remainingActions = 1;

            const actions = service.getOverWorldActions(player, mockRoomGame);
            expect(actions).toHaveLength(1);
            expect(actions[0].action).toBe(OverWorldActionType.Fight);
        });

        it('should return door action when adjacent to a door', () => {
            const mockRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.trapped));
            const player = mockRoomGame.players[0];
            player.currentPosition = { x: 1, y: 0 };
            player.playerInGame.remainingActions = 1;

            doorOpeningService.isTileDoor.returns(true);

            const actions = service.getOverWorldActions(player, mockRoomGame);
            expect(actions[0].action).toBe(OverWorldActionType.Door);
        });
    });

    describe('private method tests', () => {
        it('getActionTileType should return Fight for adjacent player', () => {
            const mockRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers));
            const map = mockRoomGame.game.map;
            const players = mockRoomGame.players;

            const actionType = (service as any).getActionTileType({ x: 1, y: 1 }, players, map);
            expect(actionType).toBe(OverWorldActionType.Fight);
        });

        it('getActionTileType should return Door for door tile', () => {
            const mockRoomGame = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.untrapped));
            const map = mockRoomGame.game.map;
            const players = mockRoomGame.players;

            doorOpeningService.isTileDoor.returns(true);

            const actionType = (service as any).getActionTileType({ x: 1, y: 1 }, players, map);
            expect(actionType).toBe(OverWorldActionType.Door);
        });
    });
});
