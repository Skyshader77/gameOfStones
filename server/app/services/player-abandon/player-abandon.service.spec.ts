import { MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING, MOCK_ROOM_ONE_PLAYER_LEFT } from '@app/constants/gameplay.test.constants';
import { Test, TestingModule } from '@nestjs/testing';
import { PlayerAbandonService } from './player-abandon.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';

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
});
