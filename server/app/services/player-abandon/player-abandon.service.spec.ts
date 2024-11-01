import { MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING } from '@app/constants/gameplay.test.constants';
import { Test, TestingModule } from '@nestjs/testing';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { PlayerAbandonService } from './player-abandon.service';

describe('PlayerAbandonService', () => {
    let playerAbandonService: PlayerAbandonService;
    let roomManagerService: RoomManagerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlayerAbandonService,
                {
                    provide: RoomManagerService,
                    useValue: {
                        getRoom: jest.fn(),
                    },
                },
            ],
        }).compile();

        playerAbandonService = module.get<PlayerAbandonService>(PlayerAbandonService);
        roomManagerService = module.get<RoomManagerService>(RoomManagerService);
    });

    it('should update the player abandon status when processing player abandonment', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING));

        jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(mockRoom);

        playerAbandonService.processPlayerAbandonment(mockRoom, 'Player1');

        expect(mockRoom.players[0].playerInGame.hasAbandonned).toBe(true);
        expect(roomManagerService.getRoom).toHaveBeenCalledWith('testRoom');
    });

    it('should not update the player abandon status if the player is not found in the room', () => {
        const mockRoom = JSON.parse(JSON.stringify(MOCK_ROOM_MULTIPLE_PLAYERS_GAME_ONGOING));

        jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(mockRoom);

        playerAbandonService.processPlayerAbandonment(mockRoom, 'Othmane');

        expect(mockRoom.players[0].playerInGame.hasAbandonned).toBe(false);
        expect(mockRoom.players[1].playerInGame.hasAbandonned).toBe(false);
        expect(mockRoom.players[2].playerInGame.hasAbandonned).toBe(false);
        expect(roomManagerService.getRoom).toHaveBeenCalledWith('testRoom');
    });
});
