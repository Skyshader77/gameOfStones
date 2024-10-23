import { ChatMessage } from '@common/interfaces/message';
import { Injectable } from '@nestjs/common';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';

@Injectable()
export class ChatManagerService {
    constructor(private roomManagerService: RoomManagerService) {}
    addChatMessageToRoom(message: ChatMessage, roomCode: string) {
        this.roomManagerService.getRoom(roomCode).chatList.push(message);
    }
}
