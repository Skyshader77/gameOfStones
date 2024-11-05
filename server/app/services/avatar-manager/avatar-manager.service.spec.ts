import { MOCK_AVATAR_ID, MOCK_SOCKET_ID } from '@app/constants/avatar-test.constants';
import { MOCK_ROOM } from '@app/constants/test.constants';
import { INITIAL_AVATAR_SELECTION } from '@common/constants/avatar-selection.constants';
import { Avatar } from '@common/enums/avatar.enum';
import { Test, TestingModule } from '@nestjs/testing';
import { AvatarManagerService } from './avatar-manager.service';

describe('AvatarManagerService', () => {
    let service: AvatarManagerService;
    const mockRoomCode = MOCK_ROOM.roomCode;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [AvatarManagerService],
        }).compile();

        service = module.get<AvatarManagerService>(AvatarManagerService);
    });

    describe('initializeAvatarList', () => {
        it('should initialize avatar maps for a new room', () => {
            service.initializeAvatarList(mockRoomCode, MOCK_AVATAR_ID, MOCK_SOCKET_ID);

            const socketAvatar = service.getAvatarBySocketId(mockRoomCode, MOCK_SOCKET_ID);
            const roomAvatars = service.getTakenAvatarsByRoomCode(mockRoomCode);
            expect(roomAvatars).toBeDefined();
            expect(roomAvatars.length).toBe(INITIAL_AVATAR_SELECTION.size);

            expect(socketAvatar).toBeDefined();
            expect(socketAvatar).toBe(MOCK_AVATAR_ID);
        });
    });

    describe('getAvatarsByRoomCode', () => {
        it('should return undefined for non-existent room', () => {
            const result = service.getTakenAvatarsByRoomCode(mockRoomCode);
            expect(result).toBeUndefined();
        });

        it('should return avatar array for existing room', () => {
            service.initializeAvatarList(mockRoomCode, MOCK_AVATAR_ID, MOCK_SOCKET_ID);
            const result = service.getTakenAvatarsByRoomCode(mockRoomCode);
            expect(result).toBeInstanceOf(Array);
        });
    });

    describe('isAvatarTaken', () => {
        beforeEach(() => {
            service.initializeAvatarList(mockRoomCode, MOCK_AVATAR_ID, MOCK_SOCKET_ID);
        });

        it('should return false for available avatar', () => {
            const result = service.isAvatarTaken(mockRoomCode, Avatar.MaleWarrior);
            expect(result).toBe(false);
        });

        it('should return true for taken avatar', () => {
            service.toggleAvatarTaken(mockRoomCode, MOCK_AVATAR_ID, MOCK_SOCKET_ID);
            const result = service.isAvatarTaken(mockRoomCode, MOCK_AVATAR_ID);
            expect(result).toBe(true);
        });
    });

    describe('toggleAvatarTaken', () => {
        beforeEach(() => {
            service.initializeAvatarList(mockRoomCode, MOCK_AVATAR_ID, MOCK_SOCKET_ID);
        });

        it('should successfully take an available avatar', () => {
            const result = service.toggleAvatarTaken(mockRoomCode, Avatar.MaleMage, MOCK_SOCKET_ID);
            expect(result).toBe(true);
            expect(service.isAvatarTaken(mockRoomCode, Avatar.MaleMage)).toBe(true);
        });

        it('should fail to take an already taken avatar', () => {
            service.toggleAvatarTaken(mockRoomCode, MOCK_AVATAR_ID, 'other-socket');
            const result = service.toggleAvatarTaken(mockRoomCode, MOCK_AVATAR_ID, MOCK_SOCKET_ID);
            expect(result).toBe(false);
        });

        it('should release previous avatar when taking a new one', () => {
            service.toggleAvatarTaken(mockRoomCode, MOCK_AVATAR_ID, MOCK_SOCKET_ID);
            service.toggleAvatarTaken(mockRoomCode, Avatar.FemaleHealer, MOCK_SOCKET_ID);

            expect(service.isAvatarTaken(mockRoomCode, MOCK_AVATAR_ID)).toBe(false);
            expect(service.isAvatarTaken(mockRoomCode, Avatar.FemaleHealer)).toBe(true);
        });
    });

    describe('setStartingAvatar', () => {
        beforeEach(() => {
            service.initializeAvatarList(mockRoomCode, MOCK_AVATAR_ID, MOCK_SOCKET_ID);
        });

        it('should assign the first available avatar', () => {
            service.setStartingAvatar(mockRoomCode, MOCK_SOCKET_ID);
            const roomAvatars = service.getTakenAvatarsByRoomCode(mockRoomCode);
            const hasTakenAvatar = [...roomAvatars.values()].some((taken) => taken === true);
            expect(hasTakenAvatar).toBe(true);
        });

        it('should return undefined for non-existent room', () => {
            const result = service.setStartingAvatar('NON_EXISTENT', MOCK_SOCKET_ID);
            expect(result).toBeUndefined();
        });
    });

    describe('removeSocket', () => {
        beforeEach(() => {
            service.initializeAvatarList(mockRoomCode, MOCK_AVATAR_ID, MOCK_SOCKET_ID);
        });

        it('should release avatar when removing socket', () => {
            service.removeSocket(mockRoomCode, MOCK_SOCKET_ID);
            expect(service.isAvatarTaken(mockRoomCode, MOCK_AVATAR_ID)).toBe(false);
        });

        it('should handle non-existent room gracefully', () => {
            expect(() => {
                service.removeSocket('NON_EXISTENT', MOCK_SOCKET_ID);
            }).not.toThrow();
        });

        it('should handle non-existent socket gracefully', () => {
            expect(() => {
                service.removeSocket(mockRoomCode, 'NON_EXISTENT');
            }).not.toThrow();
        });
    });

    describe('removeRoom', () => {
        beforeEach(() => {
            service.initializeAvatarList(mockRoomCode, MOCK_AVATAR_ID, MOCK_SOCKET_ID);
        });

        it('should remove the room and its associated data', () => {
            service.removeRoom(mockRoomCode);

            const roomAvatars = service.getTakenAvatarsByRoomCode(mockRoomCode);
            const socketAvatars = service.getAvatarBySocketId(mockRoomCode, MOCK_SOCKET_ID);

            expect(roomAvatars).toBeUndefined();
            expect(socketAvatars).toBeUndefined();
        });

        it('should handle removing a non-existent room gracefully', () => {
            expect(() => {
                service.removeRoom('NON_EXISTENT_ROOM');
            }).not.toThrow();
        });
    });

    describe('getAvatarBySocketId', () => {
        it('should return undefined when avatarsBySocket is undefined', () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (service as any).avatarsBySocket = undefined;
            const result = service.getAvatarBySocketId(mockRoomCode, MOCK_SOCKET_ID);
            expect(result).toBeUndefined();
        });

        beforeEach(() => {
            service.initializeAvatarList(mockRoomCode, MOCK_AVATAR_ID, MOCK_SOCKET_ID);
        });

        it('should return undefined for a non-existent room', () => {
            const result = service.getAvatarBySocketId('NON_EXISTENT_ROOM', MOCK_SOCKET_ID);
            expect(result).toBeUndefined();
        });

        it('should return undefined for a non-existent socket ID in the room', () => {
            const result = service.getAvatarBySocketId(mockRoomCode, 'NON_EXISTENT_SOCKET');
            expect(result).toBeUndefined();
        });

        it('should return the avatar choice for a valid room and socket ID', () => {
            const result = service.getAvatarBySocketId(mockRoomCode, MOCK_SOCKET_ID);
            expect(result).toBe(MOCK_AVATAR_ID);
        });

        it('should handle the case where the avatars map is empty for a room', () => {
            service.removeSocket(mockRoomCode, MOCK_SOCKET_ID);
            const result = service.getAvatarBySocketId(mockRoomCode, MOCK_SOCKET_ID);
            expect(result).toBeUndefined();
        });

        it('should handle the case where the room has been removed', () => {
            service.removeRoom(mockRoomCode);
            const result = service.getAvatarBySocketId(mockRoomCode, MOCK_SOCKET_ID);
            expect(result).toBeUndefined();
        });
    });
});
