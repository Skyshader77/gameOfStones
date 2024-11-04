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
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameEndService } from '@app/services/game-end/game-end.service';
import { FightLogicService } from '@app/services/fight/fight/fight.logic.service';
import { GameEndOutput } from '@app/interfaces/gameplay';
import { GameStatus } from '@common/enums/game-status.enum';
import { TIMER_RESOLUTION_MS, TimerDuration } from '@app/constants/time.constants';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { FightManagerService } from '@app/services/fight/fight/fight-manager.service';

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

    @Inject(FightLogicService)
    private fightService: FightLogicService;

    @Inject(RoomManagerService)
    private roomManagerService: RoomManagerService;

    @Inject(MessagingGateway)
    private messagingGateway: MessagingGateway;

    @Inject(FightManagerService)
    private fightManagerService: FightManagerService;

    private readonly logger = new Logger(GameGateway.name);

    constructor(private socketManagerService: SocketManagerService) {
        this.socketManagerService.setGatewayServer(Gateway.GAME, this.server);
    }

    @SubscribeMessage(GameEvents.DesireStartGame)
    startGame(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);

        if (room) {
            const playerName = this.socketManagerService.getSocketPlayerName(socket);
            const player = room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === playerName);

            const playerSpawn: PlayerStartPosition[] = this.gameStartService.startGame(room, player);
            const gameInfo: GameStartInformation = { map: room.game.map, playerStarts: playerSpawn };

            if (playerSpawn) {
                this.server.to(room.room.roomCode).emit(GameEvents.StartGame, gameInfo);
                room.game.currentPlayer = room.players[room.players.length - 1].playerInfo.userName;
                room.game.timer = this.gameTimeService.getInitialTimer();
                room.game.timer.timerSubscription = this.gameTimeService.getTimerSubject(room.game.timer).subscribe((counter: number) => {
                    this.remainingTime(room, counter);
                });
                this.changeTurn(room);
            }
        }
    }

    @SubscribeMessage(GameEvents.EndAction)
    endAction(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        if (!room || !playerName) {
            return;
        }
        if (playerName !== room.game.currentPlayer) {
            return;
        }
        room.game.hasPendingAction = false;
        if (room.game.status === GameStatus.Fight) {
            this.gameTimeService.resumeTimer(room.game.timer);
            room.game.fight = null;
            room.game.status = GameStatus.OverWorld;
        }
        const endOutput = this.gameEndService.hasGameEnded(room);
        if (endOutput.hasGameEnded) {
            this.endGame(room, endOutput);
        } else if (this.gameTurnService.isTurnFinished(room)) {
            this.changeTurn(room);
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
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        if (!room || !playerName) {
            return;
        }
        if (playerName !== room.game.currentPlayer) {
            return;
        }
        const player = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        if (player.playerInGame.remainingActions > 0) {
            const newTileTerrain = this.doorTogglingService.toggleDoor(doorLocation, roomCode);
            player.playerInGame.remainingActions--;
            if (newTileTerrain !== undefined) {
                this.server.to(roomCode).emit(GameEvents.PlayerDoor, { updatedTileTerrain: newTileTerrain, doorPosition: doorLocation });
                this.messagingGateway.sendPublicJournal(
                    room,
                    newTileTerrain === TileTerrain.ClosedDoor ? JournalEntry.DoorClose : JournalEntry.DoorOpen,
                );
                this.emitReachableTiles(room);
            }
        }
    }

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
        this.messagingGateway.sendAbandonJournal(room, playerName);

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

    @SubscribeMessage(GameEvents.DesiredFight)
    processDesiredFight(socket: Socket, opponentName: string) {
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);

        if (!room || !playerName) {
            return;
        }
        if (playerName !== room.game.currentPlayer) {
            return;
        }
        this.fightManagerService.startFight(room, opponentName, this.server);
    }

    @SubscribeMessage(GameEvents.DesiredAttack)
    processDesiredAttack(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        if (!room || !playerName || !room.game.fight) {
            return;
        }
        if (this.fightService.isCurrentFighter(room.game.fight, playerName)) {
            this.fightManagerService.fighterAttack(room);
        }
    }

    @SubscribeMessage(GameEvents.DesiredEvade)
    processDesiredEvade(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        if (!room || !playerName || !room.game.fight) {
            return;
        }
        if (this.fightService.isCurrentFighter(room.game.fight, playerName)) {
            this.fightManagerService.fighterEvade(room);
        }
    }

    @SubscribeMessage(GameEvents.EndFightAction)
    processEndFightAction(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);
        if (!room || !room.game.fight) return;

        const fight = room.game.fight;
        const playerName = this.socketManagerService.getSocketPlayerName(socket);

        if (this.fightService.isCurrentFighter(fight, playerName)) {
            if (fight.isFinished) {
                this.fightManagerService.fightEnd(room, this.server);
            } else {
                this.fightManagerService.startFightTurn(room);
            }
        }
    }

    lastStanding(room: RoomGame) {
        // send last standing to the last player
        this.messagingGateway.sendPublicJournal(room, JournalEntry.GameEnd);
        const lastPlayer = room.players.find((player) => !player.playerInGame.hasAbandoned);
        const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, lastPlayer.playerInfo.userName, Gateway.GAME);
        socket.emit(GameEvents.LastStanding);
        // destroy the room
        this.roomManagerService.deleteRoom(room.room.roomCode);
        // destroy the socket manager stuff
        // TODO
    }

    endGame(room: RoomGame, endResult: GameEndOutput) {
        this.gameTimeService.stopTimer(room.game.timer);
        room.game.timer.timerSubscription.unsubscribe();
        if (room.game.fight) {
            room.game.fight.timer.timerSubscription.unsubscribe();
        }
        room.game.winner = endResult.winningPlayerName;
        room.game.status = GameStatus.Finished;
        // TODO send stats or whatever. go see gitlab for the actual thing to do (there is one)
        this.server.to(room.room.roomCode).emit(GameEvents.EndGame, endResult);
        this.messagingGateway.sendPublicJournal(room, JournalEntry.PlayerWin);
        this.messagingGateway.sendPublicJournal(room, JournalEntry.GameEnd);
    }

    changeTurn(room: RoomGame) {
        const nextPlayerName = this.gameTurnService.nextTurn(room);
        if (nextPlayerName) {
            this.server.to(room.room.roomCode).emit(GameEvents.ChangeTurn, nextPlayerName);
            this.gameTimeService.startTimer(room.game.timer, TimerDuration.GameTurnChange);
            room.game.isTurnChange = true;
            this.messagingGateway.sendPublicJournal(room, JournalEntry.TurnStart);
        }
    }

    startTurn(room: RoomGame) {
        const roomCode = room.room.roomCode;
        room.game.isTurnChange = false;
        this.emitReachableTiles(room);
        this.gameTimeService.startTimer(room.game.timer, TimerDuration.GameTurn);
        this.server.to(roomCode).emit(GameEvents.StartTurn, TimerDuration.GameTurn);
    }

    sendMove(room: RoomGame, destination: Vec2) {
        const movementResult = this.playerMovementService.processPlayerMovement(destination, room);
        room.game.hasPendingAction = true;
        this.server.to(room.room.roomCode).emit(GameEvents.PlayerMove, movementResult);
        if (movementResult.hasTripped) {
            this.server.to(room.room.roomCode).emit(GameEvents.PlayerSlipped, room.game.currentPlayer);
            // this.endTurn(socket);
        } else if (movementResult.optimalPath.remainingMovement > 0) {
            this.emitReachableTiles(room);
        }
    }

    emitReachableTiles(room: RoomGame): void {
        const currentPlayerSocket = this.socketManagerService.getPlayerSocket(room.room.roomCode, room.game.currentPlayer, Gateway.GAME);
        if (currentPlayerSocket) {
            const reachableTiles = this.playerMovementService.getReachableTiles(room);
            currentPlayerSocket.emit(GameEvents.PossibleMovement, reachableTiles);
        }
    }

    remainingTime(room: RoomGame, count: number) {
        this.server.to(room.room.roomCode).emit(GameEvents.RemainingTime, count);

        if (room.game.timer.counter === 0) {
            setTimeout(() => {
                if (!room.game.hasPendingAction) {
                    if (room.game.isTurnChange) {
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
