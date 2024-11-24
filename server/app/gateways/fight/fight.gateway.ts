import { FightLogicService } from '@app/services/fight/fight-logic/fight-logic.service';
import { FightManagerService } from '@app/services/fight/fight-manager/fight-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Gateway } from '@common/enums/gateway.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ItemManagerService } from '@app/services/item-manager/item-manager.service';
import { ErrorMessageService } from '@app/services/error-message/error-message.service';

@WebSocketGateway({ namespace: `/${Gateway.Fight}`, cors: true })
export class FightGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;
    @Inject() private fightService: FightLogicService;
    @Inject() private fightManagerService: FightManagerService;
    @Inject() private socketManagerService: SocketManagerService;
    @Inject() private itemManagerService: ItemManagerService;
    @Inject() private errorMessageService: ErrorMessageService;
    private readonly logger = new Logger(FightGateway.name);

    @SubscribeMessage(GameEvents.DesireFight)
    processDesiredFight(socket: Socket, opponentPosition: Vec2) {
        try {
            const info = this.socketManagerService.getSocketInformation(socket);

            if (!this.socketManagerService.isSocketCurrentPlayer(info)) {
                return;
            }
            const opponent = info.room.players.find(
                (player) =>
                    player.playerInGame.currentPosition.x === opponentPosition.x && player.playerInGame.currentPosition.y === opponentPosition.y,
            );
            if (!opponent) {
                return;
            }
            this.fightManagerService.startFight(info.room, opponent.playerInfo.userName, this.server);
        } catch (error) {
            this.errorMessageService.gatewayError(Gateway.Fight, GameEvents.DesireFight, error);
        }
    }

    @SubscribeMessage(GameEvents.DesireAttack)
    processDesiredAttack(socket: Socket) {
        try {
            const info = this.socketManagerService.getSocketInformation(socket);
            if (!this.fightService.isRoomInFight(info.room)) {
                return;
            }
            if (this.fightService.isCurrentFighter(info.room.game.fight, info.playerName)) {
                info.room.game.fight.hasPendingAction = true;
                this.fightManagerService.fighterAttack(info.room);
            }
        } catch (error) {
            this.errorMessageService.gatewayError(Gateway.Fight, GameEvents.DesireAttack, error);
        }
    }

    @SubscribeMessage(GameEvents.DesireEvade)
    processDesiredEvade(socket: Socket) {
        try {
            const info = this.socketManagerService.getSocketInformation(socket);
            if (!this.fightService.isRoomInFight(info.room)) {
                return;
            }
            if (this.fightService.isCurrentFighter(info.room.game.fight, info.playerName)) {
                this.fightManagerService.fighterEscape(info.room);
            }
        } catch (error) {
            this.errorMessageService.gatewayError(Gateway.Fight, GameEvents.DesireEvade, error);
        }
    }

    @SubscribeMessage(GameEvents.EndFightAction)
    processEndFightAction(socket: Socket) {
        try {
            const info = this.socketManagerService.getSocketInformation(socket);
            if (!this.fightService.isRoomInFight(info.room)) return;
            const fight = info.room.game.fight;
            if (this.fightService.isCurrentFighter(fight, info.playerName)) {
                if (fight.isFinished) {
                    const loserPlayer = info.room.players.find((player) => player.playerInfo.userName === fight.result.loser);

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
                                room: info.room,
                                playerName: loserPlayer.playerInfo.userName,
                                itemDropPosition: loserPositions,
                                itemType: item,
                            });
                        });
                    }
                    this.fightManagerService.fightEnd(info.room, this.server);
                    fight.fighters.forEach((fighter) => {
                        fighter.playerInGame.remainingHp = fighter.playerInGame.attributes.hp;
                    });
                } else {
                    this.fightManagerService.startFightTurn(info.room);
                }
            }
        } catch (error) {
            this.errorMessageService.gatewayError(Gateway.Fight, GameEvents.EndFightAction, error);
        }
    }

    handleConnection(socket: Socket) {
        this.socketManagerService.registerSocket(socket);
    }

    handleDisconnect(socket: Socket) {
        this.socketManagerService.unregisterSocket(socket);
    }
}
