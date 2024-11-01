import { RoomGame } from '@app/interfaces/room-game';
import { DoorOpeningService } from '@app/services/door-opening/door-opening.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { GameTurnService } from '@app/services/game-turn/game-turn.service';
import { PlayerAbandonService } from '@app/services/player-abandon/player-abandon.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Gateway } from '@common/constants/gateway.constants';
import { GameStartInformation, PlayerStartPosition } from '@common/interfaces/game-start-info';
import { GameEvents } from '@common/interfaces/sockets.events/game.events';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TIMER_RESOLUTION_MS, TURN_TIME_S } from '@app/services/game-time/game-time.service.constants';
import { GameEndService } from '@app/services/game-end/game-end.service';

@WebSocketGateway({ namespace: '/game', cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;

    @Inject(GameStartService)
    private gameStartService: GameStartService;

    @Inject(PlayerMovementService)
    private playerMovementService: PlayerMovementService;

    @Inject(DoorOpeningService)
    private doorTogglingService: DoorOpeningService;

    @Inject(GameTimeService)
    private gameTimeService: GameTimeService;

    @Inject(GameTurnService)
    private gameTurnService: GameTurnService;

    @Inject(GameEndService)
    private gameEndService: GameEndService;

    @Inject(PlayerAbandonService)
    private playerAbandonService: PlayerAbandonService;

    @Inject(RoomManagerService)
    private roomManagerService: RoomManagerService;

    private readonly logger = new Logger(GameGateway.name); // Instantiate the Logger here

    constructor(private socketManagerService: SocketManagerService) {
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
                room.game.currentPlayer = room.players[room.players.length - 1].playerInfo.userName;
                room.game.timer = this.gameTimeService.getInitialTimer();
                room.game.timer.timerSubscription = this.gameTimeService.getGameTimerSubject(room.game.timer).subscribe((counter: number) => {
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
            if (this.gameTurnService.isTurnFinished(room)) {
                this.changeTurn(room);
            }
        }
    }

    @SubscribeMessage(GameEvents.EndTurn)
    endTurn(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        this.logger.log('Ending the turn');
        if (room && playerName) {
            if (room.game.currentPlayer === playerName) {
                this.changeTurn(room);
                this.logger.log('Changing Turn');
            }
        }
    }

    @SubscribeMessage(GameEvents.DesiredMove)
    processDesiredMove(socket: Socket, destination: Vec2) {
        const roomCode = this.socketManagerService.getSocketRoomCode(socket);
        const room = this.roomManagerService.getRoom(roomCode);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        if (!room || !playerName) {
            return;
        }
        if (playerName !== room.game.currentPlayer) {
            return;
        }
        this.sendMove(room, destination);
    }

    @SubscribeMessage(GameEvents.DesiredDoor)
    processDesiredDoor(socket: Socket, doorLocation: Vec2) {
        const roomCode = this.socketManagerService.getSocketRoomCode(socket);
        const room = this.socketManagerService.getSocketRoom(socket);
        if (room.game.actionsLeft > 0) {
            const newTileTerrain = this.doorTogglingService.toggleDoor(doorLocation, roomCode);
            if (newTileTerrain !== undefined) {
                room.game.actionsLeft = room.game.actionsLeft - 1;
                this.server.to(roomCode).emit(GameEvents.PlayerDoor, { updatedTileTerrain: newTileTerrain, doorPosition: doorLocation });
            }
        }
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

    @SubscribeMessage(GameEvents.Abandoned)
    processPlayerAbandonment(socket: Socket): void {
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);

        if (!room || !playerName) {
            return;
        }

        const hasPlayerAbandoned = this.playerAbandonService.processPlayerAbandonment(room, playerName);
        if (!hasPlayerAbandoned) {
            return;
        }

        if (this.gameEndService.haveAllButOnePlayerAbandoned(room.players)) {
            this.logger.log('end of the game!');
            this.lastStanding(room);
        } else {
            this.server.to(room.room.roomCode).emit(GameEvents.PlayerAbandoned, playerName);
            if (this.playerAbandonService.hasCurrentPlayerAbandoned(room)) {
                this.changeTurn(room);
            }
        }
    }

    lastStanding(room: RoomGame) {
        // send last standing to the last player
        const lastPlayer = room.players.find((player) => !player.playerInGame.hasAbandonned);
        const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, lastPlayer.playerInfo.userName, Gateway.GAME);
        socket.emit(GameEvents.LastStanding);
        // destroy the room
        this.roomManagerService.deleteRoom(room.room.roomCode);
        // destroy the socket manager stuff
        // TODO
    }

    endGame(room: RoomGame) {
        room.game.timer.timerSubscription.unsubscribe();
        // TODO send stats or whatever. go see gitlab for the actual thing to do (there is one)
        this.server.to(room.room.roomCode).emit(GameEvents.EndGame);
    }

    changeTurn(room: RoomGame) {
        const nextPlayerName = this.gameTurnService.nextTurn(room);
        this.logger.log(`Next player is ${nextPlayerName}`);
        if (nextPlayerName) {
            this.server.to(room.room.roomCode).emit(GameEvents.ChangeTurn, nextPlayerName);
            this.gameTimeService.startTurnTimer(room.game.timer, true);
        }
    }

    startTurn(room: RoomGame) {
        const roomCode = room.room.roomCode;
        this.emitReachableTiles(room);
        this.gameTimeService.startTurnTimer(room.game.timer, false);
        this.server.to(roomCode).emit(GameEvents.StartTurn, TURN_TIME_S);
    }

    sendMove(room: RoomGame, destination: Vec2) {
        const movementResult = this.playerMovementService.processPlayerMovement(destination, room);
        room.game.hasPendingAction = true;
        this.server.to(room.room.roomCode).emit(GameEvents.PlayerMove, movementResult);
        if (movementResult.hasTripped) {
            this.server.to(room.room.roomCode).emit(GameEvents.PlayerSlipped, room.game.currentPlayer);
            // this.endTurn(socket);
        } else if (movementResult.optimalPath.remainingSpeed > 0) {
            this.emitReachableTiles(room);
        }
    }

    emitReachableTiles(room: RoomGame): void {
        const currentPlayerSocket = this.socketManagerService.getPlayerSocket(room.room.roomCode, room.game.currentPlayer, Gateway.GAME);
        const reachableTiles = this.playerMovementService.getReachableTiles(room);
        currentPlayerSocket.emit(GameEvents.PossibleMovement, reachableTiles);
    }

    remainingTime(room: RoomGame, count: number) {
        this.server.to(room.room.roomCode).emit(GameEvents.RemainingTime, count);

        if (room.game.timer.turnCounter === 0) {
            setTimeout(() => {
                if (!room.game.hasPendingAction) {
                    if (room.game.timer.isTurnChange) {
                        this.startTurn(room);
                    } else {
                        this.changeTurn(room);
                    }
                }
            }, TIMER_RESOLUTION_MS);
        }
    }

    handleConnection(socket: Socket) {
        this.socketManagerService.registerSocket(socket);
        this.logger.log('game gateway initialized');
    }

    handleDisconnect(socket: Socket) {
        // TODO abandon for a disconnect (use socket.data.roomCode instead)
        // this.processPlayerAbandonment(socket);
        this.socketManagerService.unregisterSocket(socket);
        this.logger.log('game gateway disconnected!');
    }
}
