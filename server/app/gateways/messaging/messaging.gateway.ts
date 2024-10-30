import { ChatManagerService } from '@app/services/chat-manager/chat-manager.service';
import { JournalManagerService } from '@app/services/journal-manager/journal-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Gateway } from '@common/constants/gateway.constants';
import { ChatMessage, JournalLog } from '@common/interfaces/message';
import { MessagingEvents } from '@common/interfaces/sockets.events/messaging.events';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MAX_CHAT_MESSAGE_LENGTH } from '@common/constants/chat.constants';

@WebSocketGateway({ namespace: `/${Gateway.MESSAGING}`, cors: true })
@Injectable()
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;

    constructor(
        private readonly logger: Logger,
        private socketManagerService: SocketManagerService,
        private chatManagerService: ChatManagerService,
        private journalManagerService: JournalManagerService,
    ) {
        this.socketManagerService.setGatewayServer(Gateway.MESSAGING, this.server);
    }

    @SubscribeMessage(MessagingEvents.DesiredChatMessage)
    desiredChatMessage(socket: Socket, message: ChatMessage) {
        const roomCode = this.socketManagerService.getSocketRoomCode(socket);
        if (roomCode && message.message.content.length <= MAX_CHAT_MESSAGE_LENGTH) {
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
        this.server.to(roomCode).emit(MessagingEvents.ChatMessage, message);
    }

    sendChatHistory(socket: Socket, roomCode: string) {
        const olderMessages = this.chatManagerService.fetchOlderMessages(roomCode);
        if (olderMessages && olderMessages.length > 0) {
            socket.emit(MessagingEvents.ChatHistory, olderMessages);
        }
    }

    sendPublicJournal(roomCode: string, journal: JournalLog) {
        journal.isPrivate = false;
        this.journalManagerService.addJournalToRoom(journal, roomCode);
        this.server.to(roomCode).emit(MessagingEvents.JournalLog, journal);
    }

    sendPrivateJournal(roomCode: string, playerNames: string[], journal: JournalLog) {
        journal.isPrivate = true;
        this.journalManagerService.addJournalToRoom(journal, roomCode);

        playerNames.forEach((playerName: string) => {
            const socket = this.socketManagerService.getPlayerSocket(roomCode, playerName, Gateway.MESSAGING);
            if (socket) {
                socket.emit(MessagingEvents.JournalLog, journal);
            }
        });
    }
}
