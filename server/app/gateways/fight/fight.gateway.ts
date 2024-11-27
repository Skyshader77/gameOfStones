import { ErrorMessageService } from '@app/services/error-message/error-message.service';
import { FightLogicService } from '@app/services/fight/fight-logic/fight-logic.service';
import { FightManagerService } from '@app/services/fight/fight-manager/fight-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Gateway } from '@common/enums/gateway.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: `/${Gateway.Fight}`, cors: true })
export class FightGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;
    @Inject() private fightService: FightLogicService;
    @Inject() private fightManagerService: FightManagerService;
    @Inject() private socketManagerService: SocketManagerService;
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

            this.fightManagerService.startFight(info.room, opponent.playerInfo.userName);
        } catch (error) {
            this.errorMessageService.gatewayError(Gateway.Fight, GameEvents.DesireFight, error);
        }
    }

    @SubscribeMessage(GameEvents.DesiredFightTimer)
    processDesiredFightTimer(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);
        if (!room || !room.game.fight) return;
        this.fightManagerService.setupFightTimer(room);
        this.logger.log("Send desired fight received.")
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
                info.room.game.fight.hasPendingAction = true;
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
            this.fightManagerService.handleEndFightAction(info.room, info.playerName);
        } catch (error) {
            this.errorMessageService.gatewayError(Gateway.Fight, GameEvents.EndFightAction, error);
        }
    }

    afterInit() {
        this.socketManagerService.setGatewayServer(Gateway.Fight, this.server);
    }

    handleConnection(socket: Socket) {
        this.socketManagerService.registerSocket(socket);
    }

    handleDisconnect(socket: Socket) {
        this.socketManagerService.unregisterSocket(socket);
    }
}
