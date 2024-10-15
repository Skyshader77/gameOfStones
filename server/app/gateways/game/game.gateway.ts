import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { GameEvents } from './game.gateway.events';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/game', cors: true })
export class GameGateway {
    @WebSocketServer() private server: Server;

    @SubscribeMessage(GameEvents.StartTurn)
    startTurn(socket: Socket) {
        socket.emit('ayo');
    }
}
