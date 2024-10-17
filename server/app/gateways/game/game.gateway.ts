import { GameTimeService } from '@app/services/game-time/game-time.service';
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TURN_CHANGE_DELAY_MS } from './game.gateway.consts';
import { GameEvents } from './game.gateway.events';

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

    @SubscribeMessage(GameEvents.DesiredMove)
    processDesiredMove(socket: Socket) {
        // TODO:
        // Link the player Movement Service to this
        // Player MOvement Service should emit the actual MOvement vector AND the hasTrippedBoolean
        // this.server.to(roomCode).emit(GameEvents.PlayerMove, MovementResultInterface);
        // if(MovementResultInterface.hasTripped){
        // this.server.to(roomCode).emit(GameEvents.PlayerSlipped, playerId?);
        // }
    }

    @SubscribeMessage(GameEvents.DesiredFight)
    processDesiredFight(socket: Socket) {
        // TODO:
        // Create the Fight object from the interface Server Side
        // Complete the fight service
        // broadcast to everyone who is in a fight using the PlayerFight
        // broadcast to the two players in-fight who goes first using the StartFightTurn event
    }

    @SubscribeMessage(GameEvents.DesiredAttack)
    processDesiredAttack(socket: Socket) {
        // TODO:
        // Calculate the result of the dice throws if the defending player chooses to defend
        // send to the two players the result of the dice throws by PlayerAttack event
    }

    @SubscribeMessage(GameEvents.DesiredEvade)
    processDesiredEvasion(socket: Socket) {
        // TODO: route this to the fight service
        // Emit to the two players if the evasion has succeeded or not by the PlayerEvade event
    }

    // I am assuming the EndFightAction event is called after each evasion and attack to change player's turn during combat.

    // I am also assuming that the combat service will check after every turn if the combat has ended and will send a flag for the FightEnd event to be called.

    @SubscribeMessage(GameEvents.Abandoned)
    processPlayerAbandonning(socket: Socket) {
        // TODO: Disconnect the player socket
        // Broadcast to everyone that the player has abandonned using the PlayerAbandoned event
    }

    @SubscribeMessage(GameEvents.DesiredDoor)
    processPlayerOpeningDoor(socket: Socket) {
        // TODO: route this to a door service
        // TODO: Create the door service
        // Broadcast to everyone that the door was opened using the PlayerDoor event
    }

    @SubscribeMessage(GameEvents.EndTurn)
    processPlayerEndingTheirTurn(socket: Socket) {}

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
