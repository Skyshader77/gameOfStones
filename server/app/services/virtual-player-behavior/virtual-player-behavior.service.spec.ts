import { MOCK_ROOM_GAMES } from '@app/constants/player.movement.test.constants';
import { MOCK_AGGRESSIVE_VIRTUAL_PLAYER, MOCK_CLOSEST_OBJECT_DATA, MOCK_VIRTUAL_PLAYER_STATE } from '@app/constants/virtual-player-test.constants';
import { FightGateway } from '@app/gateways/fight/fight.gateway';
import { GameGateway } from '@app/gateways/game/game.gateway';
import { ClosestObjectData, VirtualPlayerState } from '@app/interfaces/ai-state';
import { ErrorMessageService } from '@app/services/error-message/error-message.service';
import { PathFindingService } from '@app/services/pathfinding/pathfinding.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SpecialItemService } from '@app/services/special-item/special-item.service';
import { VirtualPlayerHelperService } from '@app/services/virtual-player-helper/virtual-player-helper.service';
import { VirtualPlayerStateService } from '@app/services/virtual-player-state/virtual-player-state.service';
import { findPlayerAtPosition } from '@app/utils/utilities';
import { MOCK_PLAYER_IN_GAME } from '@common/constants/test-players';
import { Avatar } from '@common/enums/avatar.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { createStubInstance } from 'sinon';
import { VirtualPlayerBehaviorService } from './virtual-player-behavior.service';

describe('VirtualPlayerBehaviorService', () => {
    let service: VirtualPlayerBehaviorService;
    let roomManagerService: sinon.SinonStubbedInstance<RoomManagerService>;
    let gameGateway: sinon.SinonStubbedInstance<GameGateway>;
    let fightGateway: sinon.SinonStubbedInstance<FightGateway>;
    let helperService: sinon.SinonStubbedInstance<VirtualPlayerHelperService>;
    let stateService: sinon.SinonStubbedInstance<VirtualPlayerStateService>;
    let specialItemService: sinon.SinonStubbedInstance<SpecialItemService>;
    let mockAggressiveVirtualPlayer: Player;
    let mockClosestObjectData: ClosestObjectData;
    let pathfindingService: sinon.SinonStubbedInstance<PathFindingService>;
    let errorMessageService: sinon.SinonStubbedInstance<ErrorMessageService>;
    let mockState: VirtualPlayerState;

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
            ],
        }).compile();
        service = module.get<VirtualPlayerBehaviorService>(VirtualPlayerBehaviorService);
        mockAggressiveVirtualPlayer = JSON.parse(JSON.stringify(MOCK_AGGRESSIVE_VIRTUAL_PLAYER));
        mockClosestObjectData = MOCK_CLOSEST_OBJECT_DATA;
        // mockTurnData = JSON.parse(JSON.stringify(MOCK_TURN_DATA));
        mockState = JSON.parse(JSON.stringify(MOCK_VIRTUAL_PLAYER_STATE)) as VirtualPlayerState;
        stateService.getVirtualState.returns(mockState);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
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

    describe('findPlayerAtPosition', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_GAMES.multiplePlayers));

        it('should find player at given position', () => {
            const position: Vec2 = { x: 0, y: 0 };
            const result = findPlayerAtPosition(position, mockRoom);
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
            const result = findPlayerAtPosition(position, mockRoom);
            expect(result).toBeNull();
        });
    });

    describe('canFight', () => {
        it('should return true when player has actions and is next to opponent', () => {
            mockAggressiveVirtualPlayer.playerInGame.remainingActions = 1;
            expect(service['canFight'](mockAggressiveVirtualPlayer, mockClosestObjectData.closestPlayer.position)).toBeTruthy();
        });

        it('should return false when player has no actions', () => {
            mockAggressiveVirtualPlayer.playerInGame.remainingActions = 0;
            expect(service['canFight'](mockAggressiveVirtualPlayer, mockClosestObjectData.closestPlayer.position)).toBeFalsy();
        });

        it('should return false when opponent is not in fighting range', () => {
            mockAggressiveVirtualPlayer.playerInGame.remainingActions = 1;
            const farPlayerObjectData: ClosestObjectData = {
                ...mockClosestObjectData,
                closestPlayer: { position: { x: 2, y: 2 }, cost: 5 },
            };
            expect(service['canFight'](mockAggressiveVirtualPlayer, farPlayerObjectData.closestPlayer.position)).toBeFalsy();
        });
    });
});
