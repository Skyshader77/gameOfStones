import { ChatManagerService } from '@app/services/chat-manager/chat-manager.service';
import { JournalManagerService } from '@app/services/journal-manager/journal-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Gateway } from '@common/constants/gateway.constants';
import { ChatMessage, JournalLog } from '@common/interfaces/message';
import { ChatEvents } from '@common/interfaces/sockets.events/chat.events';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/chat', cors: true })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;

    constructor(
        private readonly logger: Logger,
        private socketManagerService: SocketManagerService,
        private chatManagerService: ChatManagerService,
        private journalManagerService: JournalManagerService,
    ) {
        this.socketManagerService.setGatewayServer(Gateway.CHAT, this.server);
    }

    @SubscribeMessage(ChatEvents.DesiredChatMessage)
    desiredChatMessage(socket: Socket, message: ChatMessage) {
        const roomCode = this.socketManagerService.getSocketRoomCode(socket);
        if (roomCode) {
            this.sendChatMessage(message, roomCode);
        }
    }

    handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
        this.socketManagerService.registerSocket(socket);
    }

    handleDisconnect(socket: Socket) {
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
        this.socketManagerService.unregisterSocket(socket);
    }

    sendChatMessage(message: ChatMessage, roomCode: string) {
        this.chatManagerService.addChatMessageToRoom(message, roomCode);
        this.server.to(roomCode).emit(ChatEvents.ChatMessage, message);
    }

    sendChatHistory(socket: Socket, roomCode: string) {
        const olderMessages = this.chatManagerService.fetchOlderMessages(roomCode);
        if (olderMessages && olderMessages.length > 0) {
            socket.emit(ChatEvents.ChatHistory, olderMessages);
        }
    }

    sendPublicJournal(roomCode: string, journal: JournalLog) {
        journal.isPrivate = false;
        this.journalManagerService.addJournalToRoom(journal, roomCode);
        this.server.to(roomCode).emit(ChatEvents.JournalLog, journal);
    }

    sendPrivateJournal(roomCode: string, playerNames: string[], journal: JournalLog) {
        journal.isPrivate = true;
        this.journalManagerService.addJournalToRoom(journal, roomCode);

        playerNames.forEach((playerName: string) => {
            const socket = this.socketManagerService.getPlayerSocket(roomCode, playerName, Gateway.CHAT);
            if (socket) {
                socket.emit(ChatEvents.JournalLog, journal);
            }
        });
    }
}
