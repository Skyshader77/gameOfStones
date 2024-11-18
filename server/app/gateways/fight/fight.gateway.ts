/* eslint-disable max-lines */ // TODO remove this in the future
import { FightLogicService } from '@app/services/fight/fight/fight-logic.service';
import { FightManagerService } from '@app/services/fight/fight/fight-manager.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Gateway } from '@common/enums/gateway.enum';
import { ServerErrorEventsMessages } from '@common/enums/sockets.events/error.events';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GameGateway } from '../game/game.gateway';

@WebSocketGateway({ namespace: `/${Gateway.Fight}`, cors: true })
export class FightGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;
    @Inject() private fightService: FightLogicService;
    @Inject() private roomManagerService: RoomManagerService;
    @Inject() private gameGateway: GameGateway;
    @Inject() private fightManagerService: FightManagerService;
    @Inject() private socketManagerService: SocketManagerService;

    private readonly logger = new Logger(FightGateway.name);

    @SubscribeMessage(GameEvents.DesireFight)
    processDesiredFight(socket: Socket, opponentName: string) {
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        try {
            if (!room || !playerName) {
                return;
            }
            if (playerName !== room.game.currentPlayer) {
                return;
            }
            this.fightManagerService.startFight(room, opponentName, this.server);
        } catch {
            const errorMessage = ServerErrorEventsMessages.errorMessageStartFight + playerName;
            this.server.to(room.room.roomCode).emit(GameEvents.ServerError, errorMessage);
        }
    }

    @SubscribeMessage(GameEvents.DesireAttack)
    processDesiredAttack(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        try {
            if (!room || !playerName || !room.game.fight) {
                return;
            }
            if (this.fightService.isCurrentFighter(room.game.fight, playerName)) {
                room.game.fight.hasPendingAction = true;
                this.fightManagerService.fighterAttack(room);
            }
        } catch {
            const errorMessage = ServerErrorEventsMessages.errorMessageAttack + playerName;
            this.server.to(room.room.roomCode).emit(GameEvents.ServerError, errorMessage);
        }
    }

    @SubscribeMessage(GameEvents.DesireEvade)
    processDesiredEvade(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        try {
            if (!room || !playerName || !room.game.fight) {
                return;
            }
            if (this.fightService.isCurrentFighter(room.game.fight, playerName)) {
                this.fightManagerService.fighterEscape(room);
                if (room.game.fight.isFinished) {
                    this.gameGateway.emitReachableTiles(room);
                }
            }
        } catch {
            const errorMessage = ServerErrorEventsMessages.errorMessageEvade + playerName;
            this.server.to(room.room.roomCode).emit(GameEvents.ServerError, errorMessage);
        }
    }

    @SubscribeMessage(GameEvents.EndFightAction)
    processEndFightAction(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);
        if (!room || !room.game.fight) return;
        const fight = room.game.fight;
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        try {
            if (this.fightService.isCurrentFighter(fight, playerName)) {
                if (fight.isFinished) {
                    const loserPlayer = room.players.find((player) => player.playerInfo.userName === fight.result.loser);
                    const loserPositions: Vec2 = JSON.parse(
                        JSON.stringify({ x: loserPlayer.playerInGame.currentPosition.x, y: loserPlayer.playerInGame.currentPosition.y }),
                    );

                    this.logger.log(loserPositions);

                    if (loserPlayer) {
                        loserPlayer.playerInGame.currentPosition = {
                            x: fight.result.respawnPosition.x,
                            y: fight.result.respawnPosition.y,
                        };

                        loserPlayer.playerInGame.inventory.forEach((item) => {
                            this.gameGateway.handleItemLost(room, loserPlayer.playerInfo.userName, loserPositions, item);
                        });
                        this.logger.log('after drop');
                    }
                    this.fightManagerService.fightEnd(room, this.server);
                    fight.fighters.forEach((fighter) => {
                        fighter.playerInGame.remainingHp = fighter.playerInGame.attributes.hp;
                    });
                    if (fight.result.winner === currentPlayer.playerInfo.userName) {
                        this.gameGateway.emitReachableTiles(room);
                    } else if (fight.result.loser === currentPlayer.playerInfo.userName) {
                        this.gameGateway.changeTurn(room);
                    }
                } else {
                    this.fightManagerService.startFightTurn(room);
                }
            }
        } catch {
            const errorMessage = ServerErrorEventsMessages.errorEndFightTurn + playerName;
            this.server.to(room.room.roomCode).emit(GameEvents.ServerError, errorMessage);
        }
    }

    handleConnection(socket: Socket) {
        this.socketManagerService.registerSocket(socket);
    }

    handleDisconnect(socket: Socket) {
        this.socketManagerService.unregisterSocket(socket);
    }
}
