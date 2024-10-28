import { GameStartInformation, PlayerStartPosition } from '@common/interfaces/game-start-info';
import { DoorOpeningService } from '@app/services/door-opening/door-opening.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { GameTurnService } from '@app/services/game-turn/game-turn.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TURN_CHANGE_DELAY_MS } from './game.gateway.consts';
import { Gateway } from '@common/constants/gateway.constants';
import { GameEvents } from '@common/interfaces/sockets.events/game.events';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { RoomGame } from '@app/interfaces/room-game';
import { Subject } from 'rxjs';

@WebSocketGateway({ namespace: '/game', cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;

    @Inject(GameStartService)
    private gameStartService: GameStartService;

    private readonly logger = new Logger(GameGateway.name); // Instantiate the Logger here

    constructor(
        private playerMovementService: PlayerMovementService,
        private doorTogglingService: DoorOpeningService,
        private socketManagerService: SocketManagerService,
        private gameTimeService: GameTimeService,
        private gameTurnService: GameTurnService,
    ) {
        this.socketManagerService.setGatewayServer(Gateway.GAME, this.server);
    }

    @SubscribeMessage(GameEvents.DesireStartGame)
    startGame(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);
        this.logger.log('Received DesireStartGame event');

        if (room) {
            const playerName = this.socketManagerService.getSocketPlayerName(socket);
            const player = room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === playerName);

            const playerSpawn: PlayerStartPosition[] = this.gameStartService.startGame(room, player);
            const gameInfo: GameStartInformation = { map: room.game.map, playerStarts: playerSpawn };

            if (playerSpawn) {
                this.server.to(room.room.roomCode).emit(GameEvents.StartGame, gameInfo);
                room.game.currentPlayer = room.players.length - 1;
                room.game.timer = { timerId: null, turnCounter: 0, fightCounter: 0, timerSubject: new Subject<number>(), timerSubscription: null };
                room.game.timer.timerSubscription = room.game.timer.timerSubject.asObservable().subscribe((counter: number) => {
                    this.remainingTime(room, counter);
                });
                this.changeTurn(room);
            }
        }
    }

    @SubscribeMessage(GameEvents.EndAction)
    endAction(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);
        if (room) {
            const timeLeft = room.game.timer.turnCounter > 0;
            if (timeLeft) {
                this.gameTimeService.resumeTurnTimer(room.game.timer);
            } else {
                this.changeTurn(room);
            }
        }
    }

    @SubscribeMessage(GameEvents.EndTurn)
    endTurn(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        if (room && playerName) {
            if (room.players[room.game.currentPlayer].playerInfo.userName === playerName) {
                this.changeTurn(room);
            }
        }
    }

    @SubscribeMessage(GameEvents.DesiredMove)
    processDesiredMove(socket: Socket, destination: Vec2) {
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);

        if (!room || !playerName) return;

        const movementResult = this.playerMovementService.processPlayerMovement(destination, room, playerName);
        if (!movementResult) return;

        this.logger.log(`Player ${playerName} wants to move to (${destination.x}, ${destination.y})`);

        const { displacementVector } = movementResult.dijkstraServiceOutput;
        if (displacementVector.length > 0) {
            this.server.to(room.room.roomCode).emit(GameEvents.PlayerMove, movementResult);

            if (movementResult.hasTripped) {
                this.server.to(room.room.roomCode).emit(GameEvents.PlayerSlipped, playerName);

                this.changeTurn(room);
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

    endGame(room: RoomGame) {
        room.game.timer.timerSubscription.unsubscribe();
        // TODO send stats or whatever. go see gitlab for the actual thing to do (there is one)
        this.server.to(room.room.roomCode).emit(GameEvents.EndGame);
    }

    changeTurn(room: RoomGame) {
        const nextPlayerName = this.gameTurnService.nextTurn(room);
        if (nextPlayerName) {
            this.server.to(room.room.roomCode).emit(GameEvents.ChangeTurn, nextPlayerName);
            setTimeout(() => {
                this.startTurn(room);
            }, TURN_CHANGE_DELAY_MS);
        }
    }

    startTurn(room: RoomGame) {
        this.gameTimeService.startTurnTimer(room.game.timer);
        this.server.to(room.room.roomCode).emit(GameEvents.StartTurn, room.game.timer.turnCounter);
    }

    remainingTime(room: RoomGame, count: number) {
        this.server.to(room.room.roomCode).emit(GameEvents.RemainingTime, count);
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
