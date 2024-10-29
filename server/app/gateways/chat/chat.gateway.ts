import { ChatManagerService } from '@app/services/chat-manager/chat-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Gateway } from '@common/constants/gateway.constants';
import { ChatMessage } from '@common/interfaces/message';
import { ChatEvents } from '@common/interfaces/sockets.events/chat.events';
import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { DELAY_BEFORE_EMITTING_TIME, WORD_MIN_LENGTH } from './chat.gateway.constants';

@WebSocketGateway({ namespace: '/chat', cors: true })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;

    constructor(
        private readonly logger: Logger,
        private socketManagerService: SocketManagerService,
        private chatManagerService: ChatManagerService,
    ) {
        this.socketManagerService.setGatewayServer(Gateway.CHAT, this.server);
    }

    @SubscribeMessage(ChatEvents.Validate)
    validate(socket: Socket, word: string) {
        socket.emit(ChatEvents.WordValidated, word?.length > WORD_MIN_LENGTH);
    }

    @SubscribeMessage(ChatEvents.ValidateACK)
    validateWithAck(_: Socket, word: string) {
        return { isValid: word?.length > WORD_MIN_LENGTH };
    }

    @SubscribeMessage(ChatEvents.RoomChatMessage)
    roomMessage(socket: Socket, message: ChatMessage) {
        const socketRoomCode = this.socketManagerService.getSocketRoomCode(socket);
        if (socketRoomCode) {
            this.logger.log(`Message : ${message}`);
            this.chatManagerService.addChatMessageToRoom(message, socketRoomCode);
            this.server.to(socketRoomCode).emit(ChatEvents.RoomChatMessage, message);
        }
    }

    afterInit() {
        setInterval(() => {
            this.emitTime();
        }, DELAY_BEFORE_EMITTING_TIME);
    }

    handleConnection(socket: Socket) {
        this.logger.log(`Connexion par l'utilisateur avec id : ${socket.id}`);
        this.socketManagerService.registerSocket(socket);
    }

    handleDisconnect(socket: Socket) {
        this.logger.log(`Déconnexion par l'utilisateur avec id : ${socket.id}`);
    }

    sendChatHistory(olderMessages: ChatMessage[], socket: Socket, roomId: string) {
        this.logger.log(`Older messages for room ${roomId}: ${JSON.stringify(olderMessages)}`);
        if (olderMessages && olderMessages.length > 0) {
            this.logger.log(`Emitting chat history to socket ${socket.id}`);
            socket.emit(ChatEvents.ChatHistory, olderMessages);
        }
    }

    private emitTime() {
        this.server.emit(ChatEvents.Clock, new Date().toLocaleTimeString());
    }
}
