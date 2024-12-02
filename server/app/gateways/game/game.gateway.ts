import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { Item } from '@app/interfaces/item';
import { RoomGame } from '@app/interfaces/room-game';
import { DoorOpeningService } from '@app/services/door-opening/door-opening.service';
import { ErrorMessageService } from '@app/services/error-message/error-message.service';
import { FightManagerService } from '@app/services/fight/fight-manager/fight-manager.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { GameTurnService } from '@app/services/game-turn/game-turn.service';
import { ItemManagerService } from '@app/services/item/item-manager/item-manager.service';
import { PlayerAbandonService } from '@app/services/player-abandon/player-abandon.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { TurnInfoService } from '@app/services/turn-info/turn-info.service';
import { VirtualPlayerStateService } from '@app/services/virtual-player-state/virtual-player-state.service';
import { isPlayerHuman, isTileUnavailable } from '@app/utils/utilities';
import { GameStatus } from '@common/enums/game-status.enum';
import { Gateway } from '@common/enums/gateway.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { GameStartInformation, PlayerStartPosition } from '@common/interfaces/game-start-info';
import { ItemUsedPayload } from '@common/interfaces/item';
import { MoveData } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CLEANUP_MESSAGE } from './game.gateway.constants';

@WebSocketGateway({ namespace: `/${Gateway.Game}`, cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    @WebSocketServer() private server: Server;
    @Inject() private gameStartService: GameStartService;
    @Inject() private playerMovementService: PlayerMovementService;
    @Inject() private doorTogglingService: DoorOpeningService;
    @Inject() private gameTimeService: GameTimeService;
    @Inject() private gameTurnService: GameTurnService;
    @Inject() private playerAbandonService: PlayerAbandonService;
    @Inject() private roomManagerService: RoomManagerService;
    @Inject() private messagingGateway: MessagingGateway;
    @Inject() private fightManagerService: FightManagerService;
    @Inject() private itemManagerService: ItemManagerService;
    @Inject() private virtualPlayerStateService: VirtualPlayerStateService;
    @Inject() private socketManagerService: SocketManagerService;
    @Inject() private turnInfoService: TurnInfoService;
    @Inject() private errorMessageService: ErrorMessageService;

    private readonly logger = new Logger(GameGateway.name);

    @SubscribeMessage(GameEvents.DesireStartGame)
    startGame(socket: Socket) {
        try {
            const info = this.socketManagerService.getSocketInformation(socket);
            const player = info.room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === info.playerName);

            const playerSpawn: PlayerStartPosition[] = this.gameStartService.startGame(info.room, player);
            const gameInfo: GameStartInformation = { map: info.room.game.map, playerStarts: playerSpawn };

            if (playerSpawn) {
                this.handleGameStart(info.room, gameInfo);
            }
        } catch (error) {
            this.errorMessageService.gatewayError(Gateway.Game, GameEvents.DesireStartGame, error);
        }
    }

    @SubscribeMessage(GameEvents.EndAction)
    endAction(socket: Socket) {
        try {
            const info = this.socketManagerService.getSocketInformation(socket);
            this.gameTurnService.handleEndAction(info.room);
        } catch (error) {
            this.errorMessageService.gatewayError(Gateway.Game, GameEvents.EndAction, error);
        }
    }

    @SubscribeMessage(GameEvents.EndTurn)
    endTurn(socket: Socket) {
        try {
            const info = this.socketManagerService.getSocketInformation(socket);
            if (this.socketManagerService.isSocketCurrentPlayer(info)) {
                this.endPlayerTurn(info.room);
            }
        } catch (error) {
            this.errorMessageService.gatewayError(Gateway.Game, GameEvents.EndTurn, error);
        }
    }

    @SubscribeMessage(GameEvents.DesireMove)
    processDesiredMove(socket: Socket, destination: Vec2) {
        try {
            const info = this.socketManagerService.getSocketInformation(socket);
            if (this.socketManagerService.isSocketCurrentPlayer(info)) {
                this.sendMove(info.room, destination);
            }
        } catch (error) {
            this.errorMessageService.gatewayError(Gateway.Game, GameEvents.DesireMove, error);
        }
    }

    @SubscribeMessage(GameEvents.DesireToggleDoor)
    processDesiredDoor(socket: Socket, doorPosition: Vec2) {
        try {
            const info = this.socketManagerService.getSocketInformation(socket);
            if (!this.socketManagerService.isSocketCurrentPlayer(info)) {
                return;
            }
            this.togglePlayerDoor(info.room, doorPosition);
        } catch (error) {
            this.errorMessageService.gatewayError(Gateway.Game, GameEvents.DesireToggleDoor, error);
        }
    }

    @SubscribeMessage(GameEvents.DesireDropItem)
    processDesireItemDrop(socket: Socket, item: ItemType): void {
        try {
            const info = this.socketManagerService.getSocketInformation(socket);
            if (!this.socketManagerService.isSocketCurrentPlayer(info)) {
                return;
            }
            this.itemManagerService.handleItemDrop(info.room, info.playerName, item);
            this.endAction(socket);
        } catch (error) {
            this.errorMessageService.gatewayError(Gateway.Game, GameEvents.DesireDropItem, error);
        }
    }

    @SubscribeMessage(GameEvents.DesireUseItem)
    processDesireUseItem(socket: Socket, itemUsedPayload: ItemUsedPayload): void {
        const info = this.socketManagerService.getSocketInformation(socket);
        try {
            this.useSpecialItem(info.room, info.playerName, itemUsedPayload);
        } catch (error) {
            this.errorMessageService.gatewayError(Gateway.Game, GameEvents.DesireUseItem, error);
        }
    }

    @SubscribeMessage(GameEvents.Abandoned)
    processPlayerAbandonment(socket: Socket): void {
        try {
            const info = this.socketManagerService.getSocketInformation(socket);
            this.handlePlayerAbandonment(info.room, info.playerName);
        } catch (error) {
            this.errorMessageService.gatewayError(Gateway.Game, GameEvents.Abandoned, error);
        }
    }

    @SubscribeMessage(GameEvents.DesireTeleport)
    processTeleport(socket: Socket, destination: Vec2) {
        try {
            const info = this.socketManagerService.getSocketInformation(socket);
            const socketPlayer = info.room.players.find((player) => player.playerInfo.userName === info.playerName);
            if (socketPlayer.playerInfo.userName !== info.room.game.currentPlayer) {
                return;
            }
            if (info.room.game.isDebugMode && !isTileUnavailable(destination, info.room.game.map.mapArray, info.room.players)) {
                socketPlayer.playerInGame.currentPosition = destination;
                const moveData: MoveData = { playerName: info.playerName, destination };
                this.server.to(info.room.room.roomCode).emit(GameEvents.Teleport, moveData);
                this.turnInfoService.sendTurnInformation(info.room);
            }
        } catch (error) {
            this.errorMessageService.gatewayError(Gateway.Game, GameEvents.DesireTeleport, error);
        }
    }

    @SubscribeMessage(GameEvents.DesireDebugMode)
    desireDebugMode(socket: Socket) {
        try {
            const info = this.socketManagerService.getSocketInformation(socket);
            info.room.game.isDebugMode = !info.room.game.isDebugMode;
            this.server.to(info.room.room.roomCode).emit(GameEvents.DebugMode, info.room.game.isDebugMode);
            this.messagingGateway.sendGenericPublicJournal(info.room, JournalEntry.DebugMode);
        } catch (error) {
            this.errorMessageService.gatewayError(Gateway.Game, GameEvents.DesireDebugMode, error);
        }
    }

    handleGameStart(room: RoomGame, gameInfo: GameStartInformation) {
        // TODO all this will be refactored when the start position removal from items
        const hasRandomItems = room.game.map.placedItems.some((item: Item) => item.type === ItemType.Random);
        if (hasRandomItems) {
            this.itemManagerService.placeRandomItems(room);
        }
        //

        this.socketManagerService.setGameSocketsRoomCode(room.room.roomCode, room.players);

        this.server.to(room.room.roomCode).emit(GameEvents.StartGame, gameInfo);
        room.game.currentPlayer = room.players[room.players.length - 1].playerInfo.userName;
        room.game.timer = this.gameTimeService.getInitialTimer();
        room.game.timer.timerSubscription = this.gameTimeService.getTimerSubject(room.game.timer).subscribe((counter: number) => {
            this.gameTurnService.remainingTime(room, counter);
        });

        this.gameTurnService.changeTurn(room);
    }

    handlePlayerAbandonment(room: RoomGame, playerName: string) {
        const hasPlayerAbandoned = this.playerAbandonService.processPlayerAbandonment(room, playerName);
        const player: Player = this.roomManagerService.getPlayerInRoom(room.room.roomCode, playerName);
        if (!hasPlayerAbandoned) {
            return;
        }
        this.messagingGateway.sendAbandonJournal(room, playerName);

        if (this.fightManagerService.isInFight(room, playerName)) {
            this.fightManagerService.processFighterAbandonment(room, playerName);
        }
        this.itemManagerService.handleInventoryLoss(player, room, null);
        this.server.to(room.room.roomCode).emit(GameEvents.PlayerAbandoned, playerName);
        this.server.emit(GameEvents.DebugMode, room.game.isDebugMode);
        this.handleRemainingPlayers(room);
    }

    sendMove(room: RoomGame, destination: Vec2) {
        const movementResult = this.playerMovementService.executePlayerMovement(destination, room);
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        room.game.hasPendingAction = true;
        if (!isPlayerHuman(currentPlayer)) {
            this.virtualPlayerStateService.handleMovement(room, movementResult);
        }
        this.server.to(room.room.roomCode).emit(GameEvents.PlayerMove, movementResult);
        if (movementResult.isOnItem) {
            this.pickUpItem(room, currentPlayer);
        }
        if (movementResult.hasTripped) {
            this.server.to(room.room.roomCode).emit(GameEvents.PlayerSlipped, currentPlayer.playerInfo.userName);
            if (isPlayerHuman(currentPlayer)) {
                this.endPlayerTurn(room); // TODO wait for endAction. will become the same logic as the jv
            }
        } else if (movementResult.optimalPath.remainingMovement > 0) {
            this.turnInfoService.sendTurnInformation(room);
        }
    }

    useSpecialItem(room: RoomGame, name: string, itemUsedPayload: ItemUsedPayload) {
        this.itemManagerService.handleItemUsed(room, name, itemUsedPayload);
    }

    pickUpItem(room: RoomGame, currentPlayer: Player) {
        this.itemManagerService.handleItemPickup(room, currentPlayer);
    }

    endPlayerTurn(room: RoomGame) {
        this.gameTurnService.changeTurn(room);
    }

    togglePlayerDoor(room: RoomGame, doorPosition: Vec2) {
        const player = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        if (player.playerInGame.remainingActions > 0) {
            room.game.hasPendingAction = true;
            const newTileTerrain = this.doorTogglingService.toggleDoor(room, doorPosition);
            this.sendDoorInformation(room, newTileTerrain);
        }
    }

    afterInit() {
        this.socketManagerService.setGatewayServer(Gateway.Game, this.server);
    }

    handleConnection(socket: Socket) {
        this.socketManagerService.registerSocket(socket);
    }

    handleDisconnect(socket: Socket) {
        const room = this.roomManagerService.getRoom(socket.data.roomCode);
        const playerName = this.socketManagerService.getDisconnectedPlayerName(socket.data.roomCode, socket);
        if (room && room.game.status !== GameStatus.Waiting && playerName) {
            this.handlePlayerAbandonment(room, playerName);
        }
        this.socketManagerService.unregisterSocket(socket);
    }

    private handleRemainingPlayers(room: RoomGame) {
        const remainingCount = this.playerAbandonService.getRemainingPlayerCount(room.players);
        if (remainingCount === 0) {
            this.gameCleanup(room);
        } else if (room.game.status !== GameStatus.Finished) {
            if (remainingCount === 1 && !this.playerAbandonService.isPlayerAloneWithBots(room.players)) {
                this.server.to(room.room.roomCode).emit(GameEvents.LastStanding);
            } else if (this.playerAbandonService.hasCurrentPlayerAbandoned(room)) {
                this.gameTurnService.changeTurn(room);
            } else {
                this.turnInfoService.sendTurnInformation(room);
            }
        }
    }

    private sendDoorInformation(room: RoomGame, newDoor: TileTerrain) {
        if (newDoor in TileTerrain) {
            this.messagingGateway.sendGenericPublicJournal(room, newDoor === TileTerrain.ClosedDoor ? JournalEntry.DoorClose : JournalEntry.DoorOpen);
            this.turnInfoService.sendTurnInformation(room);
        }
    }

    private gameCleanup(room: RoomGame) {
        this.gameTimeService.stopTimer(room.game.timer);
        room.game.timer.timerSubscription.unsubscribe();
        if (room.game.virtualState.aiTurnSubscription) {
            room.game.virtualState.aiTurnSubscription.unsubscribe();
        }
        if (room.game.fight) {
            this.gameTimeService.stopTimer(room.game.fight.timer);
            room.game.fight.timer.timerSubscription.unsubscribe();
        }
        room.players.forEach((player) => {
            this.socketManagerService.handleLeavingSockets(room.room.roomCode, player.playerInfo.userName);
        });
        this.roomManagerService.deleteRoom(room.room.roomCode);
        this.logger.log(CLEANUP_MESSAGE + room.room.roomCode);
    }
}
