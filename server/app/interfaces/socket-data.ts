import { Player } from '@common/interfaces/player';
import { Server, Socket } from 'socket.io';

export interface SocketData {
    server: Server;
    socket: Socket;
    player: Player;
    roomCode: string;
}
