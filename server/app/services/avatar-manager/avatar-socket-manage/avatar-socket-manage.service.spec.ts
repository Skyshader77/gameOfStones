import { Socket } from 'socket.io';
import { AvatarSocketManageService } from './avatar-socket-manage.service';

describe('AvatarSocketManageService', () => {
  let service: AvatarSocketManageService;
  let mockSocket1: Socket;
  let mockSocket2: Socket;

  beforeEach(() => {
    service = new AvatarSocketManageService();
    mockSocket1 = {
      id: 'socket1',
    } as Socket;
    mockSocket2 = {
      id: 'socket2',
    } as Socket;
  });

  it('should add socket to new room', () => {
    service.addSocketToRoom('room1', mockSocket1);
    const sockets = service.getAllSocketsInRoom('room1');
    expect(sockets).toHaveLength(1);
    expect(sockets[0].id).toBe('socket1');
  });

  it('should add multiple sockets to same room', () => {
    service.addSocketToRoom('room1', mockSocket1);
    service.addSocketToRoom('room1', mockSocket2);
    const sockets = service.getAllSocketsInRoom('room1');
    expect(sockets).toHaveLength(2);
    expect(sockets[0].id).toBe('socket1');
    expect(sockets[1].id).toBe('socket2');
  });

  it('should return empty array for non-existent room', () => {
    const sockets = service.getAllSocketsInRoom('nonexistent');
    expect(sockets).toHaveLength(0);
  });

  it('should delete specific socket from room', () => {
    service.addSocketToRoom('room1', mockSocket1);
    service.addSocketToRoom('room1', mockSocket2);
    service.deleteSocket('room1', 'socket1');
    const sockets = service.getAllSocketsInRoom('room1');
    expect(sockets).toHaveLength(1);
    expect(sockets[0].id).toBe('socket2');
  });

  it('should delete entire room', () => {
    service.addSocketToRoom('room1', mockSocket1);
    service.addSocketToRoom('room1', mockSocket2);
    service.deleteRoom('room1');
    expect(service.getAllSocketsInRoom('room1')).toHaveLength(0);
    expect(service.getRoomCount()).toBe(0);
  });

  it('should handle deleting socket from non-existent room', () => {
    expect(() => service.deleteSocket('nonexistent', 'socket1')).not.toThrow();
  });
});
