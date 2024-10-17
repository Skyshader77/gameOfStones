import { GameTimeService } from '@app/services/game-time/game-time.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GameGateway } from './game.gateway';

const mockPlayerMovementService = {
    setGameRoom: jest.fn(),
    processPlayerMovement: jest.fn(),
};

const mockRoomManagerService = {
    getRoom: jest.fn(),
    addRoom: jest.fn(),
};

const mockGameTimeService = {};

describe('GameGateway', () => {
    let gateway: GameGateway;
    let movementService: PlayerMovementService;
    let roomManagerService: RoomManagerService;
    let gameTimeService: GameTimeService;
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GameGateway,
                { provide: PlayerMovementService, useValue: mockPlayerMovementService },
                { provide: RoomManagerService, useValue: mockRoomManagerService },
                { provide: GameTimeService, useValue: mockGameTimeService },
            ],
        }).compile();
        movementService = module.get<PlayerMovementService>(PlayerMovementService);
        roomManagerService = module.get<RoomManagerService>(RoomManagerService);
        gameTimeService = module.get<GameTimeService>(GameTimeService);
        gateway = module.get<GameGateway>(GameGateway);
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });
});
