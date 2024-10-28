import { GameStartInformation } from '@common/interfaces/game-start-info';
import { DoorOpeningService } from '@app/services/door-opening/door-opening.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { GameTurnService } from '@app/services/game-turn/game-turn.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TURN_CHANGE_DELAY_MS } from './game.gateway.consts';
import { Gateway } from '@common/constants/gateway.constants';
import { GameEvents } from '@common/interfaces/sockets.events/game.events';
@WebSocketGateway({ namespace: '/game', cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;

    @Inject(GameStartService)
    private gameStartService: GameStartService;

    private readonly logger = new Logger(GameGateway.name); // Instantiate the Logger here

    constructor(
        private playerMovementService: PlayerMovementService,
        private doorTogglingService: DoorOpeningService,
        private socketManagerService: SocketManagerService,
        private gameTurnService: GameTurnService,
    ) {
        this.socketManagerService.setGatewayServer(Gateway.GAME, this.server);
    }

    @SubscribeMessage(GameEvents.DesireStartGame)
    startGame(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);

        if (room) {
            const playerName = this.socketManagerService.getSocketPlayerName(socket);
            const player = room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === playerName);

            const startInformation: GameStartInformation[] = this.gameStartService.startGame(room, player);

            if (startInformation) {
                this.server.to(room.room.roomCode).emit(GameEvents.StartGame, startInformation);
            }
        }
    }

    @SubscribeMessage(GameEvents.EndAction)
    endAction(socket: Socket) {
        const roomCode = this.socketManagerService.getSocketRoomCode(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        if (roomCode) {
            // TODO handle complex turn management
            // TODO check if the turn time is not 0.
            const timeLeft = true;
            if (timeLeft) {
                // this.gameTimeService.startTurnTimer();
            } else {
                this.changeTurn(roomCode, playerName);
            }
        }
    }

    @SubscribeMessage(GameEvents.EndTurn)
    endTurn(socket: Socket) {
        const roomCode = this.socketManagerService.getSocketRoomCode(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        if (roomCode && playerName) {
            this.changeTurn(roomCode, playerName);
        }
    }

    @SubscribeMessage(GameEvents.DesiredMove)
    processDesiredMove(socket: Socket, destination: Vec2) {
        const roomCode = this.socketManagerService.getSocketRoomCode(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);

        if (!roomCode || !playerName) return;

        const movementResult = this.playerMovementService.processPlayerMovement(destination, roomCode, playerName);
        if (!movementResult) return;

        this.logger.log(`Player ${playerName} wants to move to (${destination.x}, ${destination.y})`);

        const { displacementVector } = movementResult.dijkstraServiceOutput;
        if (displacementVector.length > 0) {
            this.server.to(roomCode).emit(GameEvents.PlayerMove, movementResult);

            if (movementResult.hasTripped) {
                this.server.to(roomCode).emit(GameEvents.PlayerSlipped, playerName);
            }
        }
    }

    @SubscribeMessage(GameEvents.DesiredDoor)
    processDesiredDoor(socket: Socket, doorLocation: Vec2) {
        const roomCode = this.socketManagerService.getSocketRoomCode(socket);
        const newTileTerrain = this.doorTogglingService.toggleDoor(doorLocation, roomCode);
        this.server.to(roomCode).emit(GameEvents.PlayerDoor, newTileTerrain);
    }
    // @SubscribeMessage(GameEvents.DesiredFight)
    // processDesiredFight(socket: Socket) {
    //     // TODO:
    //     // Create the Fight object from the interface Server Side
    //     // Complete the fight service
    //     // broadcast to everyone who is in a fight using the PlayerFight
    //     // broadcast to the two players in-fight who goes first using the StartFightTurn event
    // }

    // @SubscribeMessage(GameEvents.DesiredAttack)
    // processDesiredAttack(socket: Socket) {
    //     // TODO:
    //     // Calculate the result of the dice throws if the defending player chooses to defend
    //     // send to the two players the result of the dice throws by PlayerAttack event
    // }

    // @SubscribeMessage(GameEvents.DesiredEvade)
    // processDesiredEvasion(socket: Socket) {
    //     // TODO: route this to the fight service
    //     // Emit to the two players if the evasion has succeeded or not by the PlayerEvade event
    // }

    // // I am assuming the EndFightAction event is called after each evasion and attack to change player's turn during combat.

    // // I am also assuming that the combat service will check after every turn if the combat has ended and will send a flag for the FightEnd event to be called.

    // @SubscribeMessage(GameEvents.Abandoned)
    // processPlayerAbandonning(socket: Socket) {
    //     // TODO: Disconnect the player socket
    //     // Broadcast to everyone that the player has abandonned using the PlayerAbandoned event
    // }

    // @SubscribeMessage(GameEvents.DesiredDoor)
    // processPlayerOpeningDoor(socket: Socket) {
    //     // TODO: route this to a door service
    //     // TODO: Create the door service
    //     // Broadcast to everyone that the door was opened using the PlayerDoor event
    // }

    // @SubscribeMessage(GameEvents.EndTurn)
    // processPlayerEndingTheirTurn(socket: Socket) {}

    // TODO
    // find a way to add new rooms during the execution...
    afterInit() {
        // this.gameTimeService.getRoomTimerSubject().subscribe((count: number) => {
        //     this.remainingTime('ABCD', count);
        // });
    }

    changeTurn(roomCode: string, playerName: string) {
        const nextPlayerName = this.gameTurnService.nextTurn(roomCode, playerName);
        // TODO send the name of the new players turn.
        if (nextPlayerName) {
            this.logger.log(`It is now player ${playerName} 's turn`);
            this.server.to(roomCode).emit(GameEvents.ChangeTurn, nextPlayerName);
            setTimeout(() => {
                this.startTurn(roomCode);
            }, TURN_CHANGE_DELAY_MS);
        }
    }

    startTurn(roomCode: string) {
        this.server.to(roomCode).emit(GameEvents.StartTurn);
        // this.gameTimeService.startTurnTimer();
    }

    remainingTime(roomCode: string, count: number) {
        this.server.to(roomCode).emit(GameEvents.RemainingTime, count);

        // TODO
        // add the logic for when the time falls to 0 and you need to account for extra time.
    }

    handleConnection(socket: Socket) {
        this.socketManagerService.registerSocket(socket);
        this.logger.log('game gateway initialized');
    }

    handleDisconnect(socket: Socket) {
        this.socketManagerService.unregisterSocket(socket);
        this.logger.log('game gateway disconnected!');
    }
}
