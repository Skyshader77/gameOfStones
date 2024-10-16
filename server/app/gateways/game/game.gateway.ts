import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { GameEvents } from './game.gateway.events';
import { Server, Socket } from 'socket.io';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { TURN_CHANGE_DELAY_MS } from './game.gateway.consts';

@WebSocketGateway({ namespace: '/game', cors: true })
export class GameGateway implements OnGatewayInit {
    @WebSocketServer() private server: Server;

    constructor(private gameTimeService: GameTimeService) {}

    @SubscribeMessage(GameEvents.StartGame)
    startGame(socket: Socket) {
        const roomCode: string = [...socket.rooms].filter((room) => room !== socket.id)[0];

        // TODO check that the socket is the organisor of its room and that it is in a valid start
        // state.
        const valid = true;
        if (valid) {
            this.changeTurn(roomCode);
        }
    }

    @SubscribeMessage(GameEvents.EndAction)
    endAction(socket: Socket) {
        const roomCode: string = [...socket.rooms].filter((room) => room !== socket.id)[0];

        // TODO check if the turn time is not 0.
        const timeLeft = true;
        if (timeLeft) {
            this.gameTimeService.startTurnTimer();
        } else {
            this.changeTurn(roomCode);
        }
    }

    // TODO
    // find a way to add new rooms during the execution...
    afterInit() {
        this.gameTimeService.getRoomTimerSubject().subscribe((count: number) => {
            this.remainingTime('ABCD', count);
        });
    }

    changeTurn(roomCode: string) {
        // TODO send the name of the new players turn.
        this.server.to(roomCode).emit(GameEvents.ChangeTurn);
        setTimeout(() => {
            this.startTurn(roomCode);
        }, TURN_CHANGE_DELAY_MS);
    }

    startTurn(roomCode: string) {
        this.server.to(roomCode).emit(GameEvents.StartTurn);
        this.gameTimeService.startTurnTimer();
    }

    remainingTime(roomCode: string, count: number) {
        this.server.to(roomCode).emit(GameEvents.RemainingTime, count);

        // TODO
        // add the logic for when the time falls to 0 and you need to account for extra time.
    }
}
