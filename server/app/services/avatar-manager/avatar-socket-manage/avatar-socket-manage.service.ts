import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class AvatarSocketManageService {
  private sockets: Map<string, Socket[]> = new Map();

  getAllSocketsInRoom(roomCode: string): Socket[] {
    return this.sockets.get(roomCode) || [];
  }

  addSocketToRoom(roomCode: string, socket: Socket) {
    let sockets = this.sockets.get(roomCode) || [];
    sockets.push(socket);
    this.sockets.set(roomCode, sockets);
  }

  deleteSocket(roomCode: string, socketId: string) {
    let sockets = this.sockets.get(roomCode);
    if (!sockets) return;

    const newSockets = sockets.filter((socket) => socket.id !== socketId);
    this.sockets.set(roomCode, newSockets);
  }

  deleteRoom(roomCode: string) {
    this.sockets.delete(roomCode);
  }

  getRoomCount(): number {
    return this.sockets.size;
  }
}

