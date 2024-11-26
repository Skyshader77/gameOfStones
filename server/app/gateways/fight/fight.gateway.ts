import { FightLogicService } from '@app/services/fight/fight/fight-logic.service';
import { FightManagerService } from '@app/services/fight/fight/fight-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Gateway } from '@common/enums/gateway.enum';
import { ServerErrorEventsMessages } from '@common/enums/sockets.events/error.events';
import { GameEvents } from '@common/enums/sockets.events/game.events';
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

            this.fightManagerService.startFight(room, opponent.playerInfo.userName);
        } catch {
            this.logger.error('[Fight] Error when trying to fight in ', room.room.roomCode);
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
                room.game.fight.hasPendingAction = true;
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
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        try {
            this.fightManagerService.handleEndFightAction(room, playerName);
        } catch {
            const errorMessage = ServerErrorEventsMessages.errorEndFightTurn + playerName;
            this.server.to(room.room.roomCode).emit(GameEvents.ServerError, errorMessage);
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
