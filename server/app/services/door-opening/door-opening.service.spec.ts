import { MOCK_ROOM_GAME_TRAPPED, MOCK_ROOM_UNTRAPPED } from '@app/constants/player.movement.test.constants';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Vec2 } from '@common/interfaces/vec2';
import { Test, TestingModule } from '@nestjs/testing';
import { DoorOpeningService } from './door-opening.service';
import { TileTerrain } from '@common/enums/tile-terrain.enum';

describe('DoorOpeningService', () => {
    let doorOpeningService: DoorOpeningService;
    let roomManagerService: RoomManagerService;

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
            ],
        }).compile();
        roomManagerService = module.get<RoomManagerService>(RoomManagerService);
        doorOpeningService = module.get<DoorOpeningService>(DoorOpeningService);
    });

    it('should be defined', () => {
        expect(doorOpeningService).toBeDefined();
    });

    it('should open a closed door', () => {
        const doorPosition: Vec2 = { x: 0, y: 0 };
        const getRoomSpy = jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(MOCK_ROOM_GAME_TRAPPED);
        const mockRoomGame = MOCK_ROOM_GAME_TRAPPED;
        const result = doorOpeningService.toggleDoor(doorPosition, MOCK_ROOM_GAME_TRAPPED.room.roomCode);

        expect(getRoomSpy).toHaveBeenCalledWith(MOCK_ROOM_GAME_TRAPPED.room.roomCode);
        expect(roomManagerService.getRoom).toHaveBeenCalledWith(MOCK_ROOM_GAME_TRAPPED.room.roomCode);
        expect(mockRoomGame.game.map.mapArray[0][0]).toBe(TileTerrain.OPENDOOR);
        expect(result).toBe(TileTerrain.OPENDOOR);
        expect(roomManagerService.updateRoom).toHaveBeenCalledWith(MOCK_ROOM_GAME_TRAPPED.room.roomCode, mockRoomGame);
    });

    it('should close an open door', () => {
        const doorPosition: Vec2 = { x: 1, y: 1 };
        const getRoomSpy = jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(MOCK_ROOM_UNTRAPPED);
        const mockRoomGame = MOCK_ROOM_UNTRAPPED;
        const result = doorOpeningService.toggleDoor(doorPosition, MOCK_ROOM_UNTRAPPED.room.roomCode);

        expect(getRoomSpy).toHaveBeenCalledWith(MOCK_ROOM_UNTRAPPED.room.roomCode);
        expect(roomManagerService.getRoom).toHaveBeenCalledWith(MOCK_ROOM_UNTRAPPED.room.roomCode);
        expect(mockRoomGame.game.map.mapArray[1][1]).toBe(TileTerrain.CLOSEDDOOR);
        expect(result).toBe(TileTerrain.CLOSEDDOOR);
        expect(roomManagerService.updateRoom).toHaveBeenCalledWith(MOCK_ROOM_UNTRAPPED.room.roomCode, mockRoomGame);
    });

    it('should return undefined if the terrain is not a door', () => {
        const doorPosition: Vec2 = { x: 0, y: 1 };
        const getRoomSpy = jest.spyOn(roomManagerService, 'getRoom').mockReturnValue(MOCK_ROOM_GAME_TRAPPED);

        const result = doorOpeningService.toggleDoor(doorPosition, MOCK_ROOM_GAME_TRAPPED.room.roomCode);

        expect(getRoomSpy).toHaveBeenCalledWith(MOCK_ROOM_UNTRAPPED.room.roomCode);
        expect(roomManagerService.getRoom).toHaveBeenCalledWith(MOCK_ROOM_GAME_TRAPPED.room.roomCode);
        expect(result).toBeUndefined();
        expect(roomManagerService.updateRoom).not.toHaveBeenCalled();
    });
});
