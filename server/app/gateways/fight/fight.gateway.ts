import { GameGateway } from '@app/gateways/game/game.gateway';
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
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { ItemManagerService } from '@app/services/item-manager/item-manager.service';
import { GameTurnService } from '@app/services/game-turn/game-turn.service';

@WebSocketGateway({ namespace: `/${Gateway.Fight}`, cors: true })
export class FightGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;
    @Inject() private fightService: FightLogicService;
    @Inject() private roomManagerService: RoomManagerService;
    @Inject() private gameGateway: GameGateway;
    @Inject() private fightManagerService: FightManagerService;
    @Inject() private socketManagerService: SocketManagerService;
    @Inject() private playerMovementService: PlayerMovementService;
    @Inject() private itemManagerService: ItemManagerService;
    @Inject() private gameTurnService: GameTurnService;
    private readonly logger = new Logger(FightGateway.name);

    @SubscribeMessage(GameEvents.DesireFight)
    processDesiredFight(socket: Socket, opponentPosition: Vec2) {
        const room = this.socketManagerService.getSocketRoom(socket);
        try {
            const playerName = this.socketManagerService.getSocketPlayerName(socket);
            const opponent = room.players.find(
                (player) =>
                    player.playerInGame.currentPosition.x === opponentPosition.x && player.playerInGame.currentPosition.y === opponentPosition.y,
            );
            if (!room || !playerName || !opponent) {
                return;
            }
            if (playerName !== room.game.currentPlayer) {
                return;
            }

            this.fightManagerService.startFight(room, opponent.playerInfo.userName, this.server);
        } catch {
            this.logger.error('[Fight] Error when trying to fight in ', room.room.roomCode);
        }
    }

    @SubscribeMessage(GameEvents.DesiredFightTimer)
    processDesiredFightTimer(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);
        if (!room || !room.game.fight) return;
        this.fightManagerService.startFightTimer(room);
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
        try {
            if (this.fightService.isCurrentFighter(fight, playerName)) {
                if (fight.isFinished) {
                    const loserPlayer = room.players.find((player) => player.playerInfo.userName === fight.result.loser);

                    if (loserPlayer) {
                        loserPlayer.playerInGame.currentPosition = {
                            x: fight.result.respawnPosition.x,
                            y: fight.result.respawnPosition.y,
                        };
                        const loserPositions: Vec2 = JSON.parse(
                            JSON.stringify({ x: loserPlayer.playerInGame.currentPosition.x, y: loserPlayer.playerInGame.currentPosition.y }),
                        );
                        loserPlayer.playerInGame.inventory.forEach((item) => {
                            this.itemManagerService.handleItemLost({
                                room,
                                playerName: loserPlayer.playerInfo.userName,
                                itemDropPosition: loserPositions,
                                itemType: item,
                            });
                        });
                    }
                    this.fightManagerService.fightEnd(room, this.server);
                    fight.fighters.forEach((fighter) => {
                        fighter.playerInGame.remainingHp = fighter.playerInGame.attributes.hp;
                    });
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
