import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { ChatMessage } from '@common/interfaces/message';
import { MessagingEvents } from '@common/interfaces/sockets.events/messaging.events';
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class ChatManagerService {
    constructor(private roomManagerService: RoomManagerService) {}

    addChatMessageToRoom(message: ChatMessage, roomCode: string) {
        this.roomManagerService.getRoom(roomCode).chatList.push(message);
    }

    fetchOlderMessages(roomCode: string) {
        return this.roomManagerService.getRoom(roomCode).chatList;
    }

    sendChatHistory(socket: Socket, roomCode: string) {
        const olderMessages: ChatMessage[] = this.fetchOlderMessages(roomCode);
        if (olderMessages && olderMessages.length > 0) {
            socket.emit(MessagingEvents.ChatHistory, olderMessages);
        }
    }
}
