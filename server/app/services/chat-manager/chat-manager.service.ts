import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { ChatMessage } from '@common/interfaces/message';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatManagerService {
    constructor(private roomManagerService: RoomManagerService) {}

    addChatMessageToRoom(message: ChatMessage, roomCode: string) {
        this.roomManagerService.getRoom(roomCode).chatList.push(message);
    }

    fetchOlderMessages(roomCode: string) {
        return this.roomManagerService.getRoom(roomCode).chatList;
    }
}
