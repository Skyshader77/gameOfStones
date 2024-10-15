import { Injectable, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/room', cors: true })
@Injectable()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
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
