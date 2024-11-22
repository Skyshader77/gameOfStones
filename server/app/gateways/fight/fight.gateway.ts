import { FightLogicService } from '@app/services/fight/fight/fight-logic.service';
import { FightManagerService } from '@app/services/fight/fight/fight-manager.service';
import { ItemManagerService } from '@app/services/item-manager/item-manager.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Gateway } from '@common/enums/gateway.enum';
import { ServerErrorEventsMessages } from '@common/enums/sockets.events/error.events';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: `/${Gateway.Fight}`, cors: true })
export class FightGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;
    @Inject() private fightService: FightLogicService;
    @Inject() private roomManagerService: RoomManagerService;
    @Inject() private fightManagerService: FightManagerService;
    @Inject() private playerMovementService: PlayerMovementService;
    @Inject() private itemManagerService: ItemManagerService;
    private readonly logger = new Logger(FightGateway.name);

    constructor(private socketManagerService: SocketManagerService) {}

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

    handleConnection(socket: Socket) {
        this.socketManagerService.registerSocket(socket);
        this.socketManagerService.setGatewayServer(Gateway.Fight, this.server);
    }

    handleDisconnect(socket: Socket) {
        this.socketManagerService.unregisterSocket(socket);
    }
}
