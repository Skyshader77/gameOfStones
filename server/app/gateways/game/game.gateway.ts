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
import { FIGHT_NO_EVASION_TIME_S, FIGHT_WITH_EVASION_TIME_S, TIMER_RESOLUTION_MS, TURN_TIME_S } from '@app/services/game-time/game-time.service.constants';
import { GameEndService } from '@app/services/game-end/game-end.service';
import { FightService } from '@app/services/fight/fight/fight.service';
import { GameEndOutput } from '@app/interfaces/gameplay';

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

    @Inject(FightService)
    private fightService: FightService;

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
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        if (!room || !playerName) {
            return;
        }
        if (playerName !== room.game.currentPlayer) {
            return;
        }
        if (this.gameTurnService.isTurnFinished(room)) {
            this.changeTurn(room);
            if (room) {
                const endOutput = this.gameEndService.hasGameEnded(room);
                if (endOutput.hasGameEnded) {
                    this.endGame(room, endOutput);
                } else if (this.gameTurnService.isTurnFinished(room)) {
                    this.changeTurn(room);
                }
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
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        if (!room || !playerName) {
            return;
        }
        if (playerName !== room.game.currentPlayer) {
            return;
        }
        const player = room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === playerName);
        if (player.playerInGame.remainingActions > 0) {
            const newTileTerrain = this.doorTogglingService.toggleDoor(doorLocation, roomCode);
            if (newTileTerrain !== undefined) {
                this.server.to(roomCode).emit(GameEvents.PlayerDoor, { updatedTileTerrain: newTileTerrain, doorPosition: doorLocation });
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
        this.startFight(room, opponentName);
    }

    @SubscribeMessage(GameEvents.DesiredAttack)
    processDesiredAttack(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        if (!room || !playerName) {
            return;
        }
        this.fighterAttack(room);
    }

    @SubscribeMessage(GameEvents.DesiredEvade)
    processDesiredEvade(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        if (!room || !playerName) {
            return;
        }
        this.fighterEvade(room);
    }

    @SubscribeMessage(GameEvents.EndFightAction)
    processEndFightAction(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);
        if (room) {
            // if (this.fightService.isFightTurnFinished(room.game.fight)) {
            this.startFightTurn(room);
            // }
        }
    }

    lastStanding(room: RoomGame) {
        // send last standing to the last player
        const lastPlayer = room.players.find((player) => !player.playerInGame.hasAbandoned);
        const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, lastPlayer.playerInfo.userName, Gateway.GAME);
        socket.emit(GameEvents.LastStanding);
        // destroy the room
        this.roomManagerService.deleteRoom(room.room.roomCode);
        // destroy the socket manager stuff
        // TODO
    }

    endGame(room: RoomGame, endResult: GameEndOutput) {
        room.game.timer.timerSubscription.unsubscribe();
        if (room.game.fight) {
            room.game.fight.timer.timerSubscription.unsubscribe();
        }
        room.game.winner = endResult.winningPlayerName;
        // TODO send stats or whatever. go see gitlab for the actual thing to do (there is one)
        this.server.to(room.room.roomCode).emit(GameEvents.EndGame, endResult);
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
        } else if (movementResult.optimalPath.remainingMovement > 0) {
            this.emitReachableTiles(room);
        }
    }

    emitReachableTiles(room: RoomGame): void {
        const currentPlayerSocket = this.socketManagerService.getPlayerSocket(room.room.roomCode, room.game.currentPlayer, Gateway.GAME);
        const reachableTiles = this.playerMovementService.getReachableTiles(room);
        currentPlayerSocket.emit(GameEvents.PossibleMovement, reachableTiles);
    }

    startFight(room: RoomGame, opponentName: string) {
        if (this.fightService.isFightValid(room, opponentName)) {
            this.fightService.initializeFight(room, opponentName);
            const fightOrder = room.game.fight.fighters.map((fighter) => fighter.playerInfo.userName);
            this.server.to(room.room.roomCode).emit(GameEvents.StartFight, fightOrder);
            this.gameTimeService.stopTimer(room.game.timer);
            room.game.fight.timer = this.gameTimeService.getInitialTimer();
            // room.game.fight.timer.timerSubscription = this.gameTimeService.getGameTimerSubject(room.game.fight.timer).subscribe((counter: number) => {
            //     this.remainingFightTime(room, counter);
            // });
            this.startFightTurn(room);
        }
    }

    startFightTurn(room: RoomGame) {
        const nextFighterName = this.fightService.nextFightTurn(room.game.fight);
        room.game.fight.fighters.forEach((fighter) => {
            const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, fighter.playerInfo.userName, Gateway.GAME);
            // const hasEvasions = room.game.fight.numbEvasionsLeft[0] === 0 || room.game.fight.numbEvasionsLeft[1] === 0;
            // this.gameTimeService.startFightTurnTimer(room.game.fight.timer, hasEvasions);
            // TODO send the correct time
            socket.emit(GameEvents.StartFightTurn, nextFighterName, FIGHT_WITH_EVASION_TIME_S);
        });
    }

    fighterAttack(room: RoomGame) {
        const attackResult = this.fightService.attack(room.game.fight);
        room.game.fight.fighters.forEach((fighter) => {
            const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, fighter.playerInfo.userName, Gateway.GAME);
            socket.emit(GameEvents.FighterAttack, attackResult);
        });

        if (attackResult.wasWinningBlow) {
            this.fightEnd(room);
        }
    }

    fighterEvade(room: RoomGame) {
        const evasionSuccessful = this.fightService.evade(room.game.fight);
        room.game.fight.fighters.forEach((fighter) => {
            const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, fighter.playerInfo.userName, Gateway.GAME);
            socket.emit(GameEvents.FighterEvade, evasionSuccessful);
        });

        if (evasionSuccessful) {
            this.fightEnd(room);
        }
    }

    fightEnd(room: RoomGame) {
        room.game.fight.fighters.forEach((fighter) => {
            const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, fighter.playerInfo.userName, Gateway.GAME);
            socket.emit(GameEvents.FightEnd, room.game.fight.winner);
        });
    }

    remainingTime(room: RoomGame, count: number) {
        this.server.to(room.room.roomCode).emit(GameEvents.RemainingTime, count);

        if (room.game.timer.counter === 0) {
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

    remainingFightTime(room: RoomGame, count: number) {
        room.game.fight.fighters.forEach((fighter) => {
            const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, fighter.playerInfo.userName, Gateway.GAME);
            socket.emit(GameEvents.RemainingTime, count);
        });

        if (room.game.fight.timer.counter === 0) {
            setTimeout(() => {
                if (!room.game.fight.hasPendingAction) {
                    this.startFightTurn(room);
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
