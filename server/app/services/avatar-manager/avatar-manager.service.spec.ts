import { MOCK_AVATAR_ID, MOCK_SOCKET_ID } from '@app/constants/avatar-test.constants';
import { MOCK_ROOM } from '@app/constants/test.constants';
import { INITIAL_AVATAR_SELECTION } from '@common/constants/avatar-selection.constants';
import { Test, TestingModule } from '@nestjs/testing';
import { AvatarManagerService } from './avatar-manager.service';
import { Avatar } from '@common/enums/avatar.enum';

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
            const result = service.isAvatarTaken(mockRoomCode, Avatar.AVATAR4);
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
            const result = service.toggleAvatarTaken(mockRoomCode, Avatar.AVATAR3, MOCK_SOCKET_ID);
            expect(result).toBe(true);
            expect(service.isAvatarTaken(mockRoomCode, Avatar.AVATAR3)).toBe(true);
        });

        it('should fail to take an already taken avatar', () => {
            service.toggleAvatarTaken(mockRoomCode, MOCK_AVATAR_ID, 'other-socket');
            const result = service.toggleAvatarTaken(mockRoomCode, MOCK_AVATAR_ID, MOCK_SOCKET_ID);
            expect(result).toBe(false);
        });

        it('should release previous avatar when taking a new one', () => {
            service.toggleAvatarTaken(mockRoomCode, MOCK_AVATAR_ID, MOCK_SOCKET_ID);
            service.toggleAvatarTaken(mockRoomCode, Avatar.AVATAR2, MOCK_SOCKET_ID);

            expect(service.isAvatarTaken(mockRoomCode, MOCK_AVATAR_ID)).toBe(false);
            expect(service.isAvatarTaken(mockRoomCode, Avatar.AVATAR2)).toBe(true);
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
});
