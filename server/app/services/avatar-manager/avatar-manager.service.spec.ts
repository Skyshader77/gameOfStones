import { MOCK_AVATAR_NAME, MOCK_SOCKET_ID } from '@app/constants/avatar-test.constants';
import { MOCK_ROOM } from '@app/constants/test.constants';
import { INITIAL_AVATAR_SELECTION } from '@common/constants/avatar-selection.constants';
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
      service.initializeAvatarList(mockRoomCode);
      
      const roomAvatars = service.getAvatarsByRoomCode(mockRoomCode);
      expect(roomAvatars).toBeDefined();
      expect(roomAvatars.size).toBe(INITIAL_AVATAR_SELECTION.size);
    });
  });

  describe('getAvatarsByRoomCode', () => {
    it('should return undefined for non-existent room', () => {
      const result = service.getAvatarsByRoomCode(mockRoomCode);
      expect(result).toBeUndefined();
    });

    it('should return avatar map for existing room', () => {
      service.initializeAvatarList(mockRoomCode);
      const result = service.getAvatarsByRoomCode(mockRoomCode);
      expect(result).toBeInstanceOf(Map);
    });
  });

  describe('isAvatarTaken', () => {
    beforeEach(() => {
      service.initializeAvatarList(mockRoomCode);
    });

    it('should return false for available avatar', () => {
      const result = service.isAvatarTaken(mockRoomCode, MOCK_AVATAR_NAME);
      expect(result).toBe(false);
    });

    it('should return true for taken avatar', () => {
      service.toggleAvatarTaken(mockRoomCode, MOCK_AVATAR_NAME, MOCK_SOCKET_ID);
      const result = service.isAvatarTaken(mockRoomCode, MOCK_AVATAR_NAME);
      expect(result).toBe(true);
    });
  });

  describe('toggleAvatarTaken', () => {
    beforeEach(() => {
      service.initializeAvatarList(mockRoomCode);
    });

    it('should successfully take an available avatar', () => {
      const result = service.toggleAvatarTaken(mockRoomCode, MOCK_AVATAR_NAME, MOCK_SOCKET_ID);
      expect(result).toBe(true);
      expect(service.isAvatarTaken(mockRoomCode, MOCK_AVATAR_NAME)).toBe(true);
    });

    it('should fail to take an already taken avatar', () => {
      service.toggleAvatarTaken(mockRoomCode, MOCK_AVATAR_NAME, 'other-socket');
      const result = service.toggleAvatarTaken(mockRoomCode, MOCK_AVATAR_NAME, MOCK_SOCKET_ID);
      expect(result).toBe(false);
    });

    it('should release previous avatar when taking a new one', () => {
      const firstAvatar = 'Avatar1';
      const secondAvatar = 'Avatar2';
      
      service.toggleAvatarTaken(mockRoomCode, firstAvatar, MOCK_SOCKET_ID);
      service.toggleAvatarTaken(mockRoomCode, secondAvatar, MOCK_SOCKET_ID);
      
      expect(service.isAvatarTaken(mockRoomCode, firstAvatar)).toBe(false);
      expect(service.isAvatarTaken(mockRoomCode, secondAvatar)).toBe(true);
    });
  });

  describe('setStartingAvatar', () => {
    beforeEach(() => {
      service.initializeAvatarList(mockRoomCode);
    });

    it('should assign the first available avatar', () => {
      service.setStartingAvatar(mockRoomCode, MOCK_SOCKET_ID);
      const roomAvatars = service.getAvatarsByRoomCode(mockRoomCode);
      const hasTakenAvatar = [...roomAvatars!.values()].some(taken => taken === true);
      expect(hasTakenAvatar).toBe(true);
    });

    it('should return undefined for non-existent room', () => {
      const result = service.setStartingAvatar('NON_EXISTENT', MOCK_SOCKET_ID);
      expect(result).toBeUndefined();
    });
  });

  describe('removeSocket', () => {
    beforeEach(() => {
      service.initializeAvatarList(mockRoomCode);
    });

    it('should release avatar when removing socket', () => {
      service.toggleAvatarTaken(mockRoomCode, MOCK_AVATAR_NAME, MOCK_SOCKET_ID);
      service.removeSocket(mockRoomCode, MOCK_SOCKET_ID);
      expect(service.isAvatarTaken(mockRoomCode, MOCK_AVATAR_NAME)).toBe(false);
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
})
