import {
    MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING,
    MOCK_ROOM_ONE_PLAYER_LEFT,
    MOCK_ROOM_ONE_PLAYER_LEFT_WITH_BOTS,
} from '@app/constants/gameplay.test.constants';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PlayerAbandonService } from './player-abandon.service';
import { RoomGame } from '@app/interfaces/room-game';
import { PlayerRole } from '@common/enums/player-role.enum';
import { MOCK_PLAYERS } from '@app/constants/test.constants';

describe('PlayerAbandonService', () => {
    let playerAbandonService: PlayerAbandonService;
    let socketManagerService: SocketManagerService;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlayerAbandonService,
                {
                    provide: SocketManagerService,
                    useValue: {
                        handleLeavingSockets: jest.fn(),
                    },
                },
            ],
        }).compile();

        playerAbandonService = module.get<PlayerAbandonService>(PlayerAbandonService);
        socketManagerService = module.get<SocketManagerService>(SocketManagerService);
    });

    it('should update the player abandon status when processing player abandonment', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ONE_PLAYER_LEFT));
        playerAbandonService.processPlayerAbandonment(mockRoom, 'Player1');

        expect(mockRoom.players[0].playerInGame.hasAbandoned).toBe(true);
        expect(socketManagerService.handleLeavingSockets).toHaveBeenCalledTimes(1);
    });

    it('should remove debug mode when organizor abandons', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ONE_PLAYER_LEFT)) as RoomGame;
        mockRoom.players[0].playerInfo.role = PlayerRole.Organizer;
        mockRoom.game.isDebugMode = true;
        playerAbandonService.processPlayerAbandonment(mockRoom, 'Player1');

        expect(mockRoom.players[0].playerInGame.hasAbandoned).toBe(true);
        expect(mockRoom.game.isDebugMode).toBe(false);
        expect(socketManagerService.handleLeavingSockets).toHaveBeenCalledTimes(1);
    });

    it('should not update the player abandon status if the player is not found in the room', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING));

        playerAbandonService.processPlayerAbandonment(mockRoom, 'Othmane');

        expect(mockRoom.players[0].playerInGame.hasAbandoned).toBe(false);
        expect(mockRoom.players[1].playerInGame.hasAbandoned).toBe(false);
        expect(mockRoom.players[2].playerInGame.hasAbandoned).toBe(false);
        expect(socketManagerService.handleLeavingSockets).toHaveBeenCalledTimes(0);
    });

    it('should return true if the current Player has abandonned', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ONE_PLAYER_LEFT));
        playerAbandonService.processPlayerAbandonment(mockRoom, 'Player1');
        expect(playerAbandonService.hasCurrentPlayerAbandoned(mockRoom)).toBe(true);
        expect(mockRoom.players[0].playerInGame.hasAbandoned).toBe(true);
        expect(socketManagerService.handleLeavingSockets).toHaveBeenCalledTimes(1);
    });

    it('should return true if the current Player is alone with bots', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ONE_PLAYER_LEFT_WITH_BOTS));
        expect(playerAbandonService.isPlayerAloneWithBots(mockRoom.players)).toBe(true);
    });

    it('should return false if the current Player is not alone with bots', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ONE_PLAYER_LEFT));
        expect(playerAbandonService.isPlayerAloneWithBots(mockRoom.players)).toBe(false);
    });

    it('should count the players', () => {
        expect(playerAbandonService.getRemainingPlayerCount(MOCK_PLAYERS)).toEqual(2);
    });

    it('should check if current player has abandonned', () => {
        expect(playerAbandonService.hasCurrentPlayerAbandoned(MOCK_ROOM_ONE_PLAYER_LEFT)).toEqual(true);
    });

    it('should return false if no currentPlayer', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_ONE_PLAYER_LEFT)) as RoomGame;
        mockRoom.game.currentPlayer = 'Bobby brown';
        expect(playerAbandonService.hasCurrentPlayerAbandoned(mockRoom)).toEqual(false);
    });
});
