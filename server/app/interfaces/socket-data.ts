import { Server, Socket } from 'socket.io';
import { Player } from './player';

export interface SocketData {
    server: Server;
    socket: Socket;
    player: Player;
    roomId: string;
}
