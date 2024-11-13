import { MOCK_ROOM_GAMES } from '@app/constants/player.movement.test.constants';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Vec2 } from '@common/interfaces/vec2';
import { Test, TestingModule } from '@nestjs/testing';
import { DoorOpeningService } from './door-opening.service';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';

describe('DoorOpeningService', () => {
    let doorOpeningService: DoorOpeningService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DoorOpeningService,
                {
                    provide: RoomManagerService,
                    useValue: {
                        getRoom: jest.fn(),
                        updateRoom: jest.fn(),
                    },
                },
                {
                    provide: GameStatsService,
                    useValue: {
                        processDoorToggleStats: jest.fn(),
                    },
                },
            ],
        }).compile();
        doorOpeningService = module.get<DoorOpeningService>(DoorOpeningService);
    });

    it('should be defined', () => {
        expect(doorOpeningService).toBeDefined();
    });

    it('should open a closed door', () => {
        const doorPosition: Vec2 = { x: 0, y: 0 };
        const mockRoomGame = MOCK_ROOM_GAMES.trapped;
        const result = doorOpeningService.toggleDoor(MOCK_ROOM_GAMES.trapped, doorPosition);

        expect(mockRoomGame.game.map.mapArray[0][0]).toBe(TileTerrain.OpenDoor);
        expect(result).toBe(TileTerrain.OpenDoor);
    });

    it('should close an open door', () => {
        const doorPosition: Vec2 = { x: 1, y: 1 };
        const mockRoomGame = MOCK_ROOM_GAMES.untrapped;
        const result = doorOpeningService.toggleDoor(MOCK_ROOM_GAMES.untrapped, doorPosition);

        expect(mockRoomGame.game.map.mapArray[1][1]).toBe(TileTerrain.ClosedDoor);
        expect(result).toBe(TileTerrain.ClosedDoor);
    });

    it('should return undefined if the terrain is not a door', () => {
        const doorPosition: Vec2 = { x: 1, y: 0 };

        const result = doorOpeningService.toggleDoor(MOCK_ROOM_GAMES.trapped, doorPosition);

        expect(result).toBeUndefined();
    });

    it('should not close a door if another player is there', () => {
        const doorPosition: Vec2 = { x: 1, y: 1 };
        const result = doorOpeningService.toggleDoor(MOCK_ROOM_GAMES.untrappedTwoPlayers, doorPosition);

        expect(result).toBeUndefined();
    });
});
