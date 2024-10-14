import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PRIVATE_ROOM_ID } from '../chat/chat.gateway.constants';

@WebSocketGateway({ namespace: '/move', cors: true })
@Injectable()
export class MoveGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly room = PRIVATE_ROOM_ID;
    @WebSocketServer() private server: Server;
    
    constructor(private readonly logger: Logger) {}

    @SubscribeMessage('hello world!')
    validate(socket: Socket, word: string) {
        socket.emit('hello world!', word);
    }

    afterInit() {
        this.logger.log('initialised the room!');
    }

    handleConnection() {
        this.logger.log('connected!');
    }

    handleDisconnect() {
        this.logger.log('disconnected!');
    }
}