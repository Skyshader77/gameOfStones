/* eslint-disable max-lines */ // TODO remove this in the future
import { TIMER_RESOLUTION_MS } from '@app/constants/time.constants';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { Item } from '@app/interfaces/item';
import { RoomGame } from '@app/interfaces/room-game';
import { DoorOpeningService } from '@app/services/door-opening/door-opening.service';
import { FightLogicService } from '@app/services/fight/fight/fight-logic.service';
import { FightManagerService } from '@app/services/fight/fight/fight-manager.service';
import { GameEndService } from '@app/services/game-end/game-end.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { GameTurnService } from '@app/services/game-turn/game-turn.service';
import { ItemManagerService } from '@app/services/item-manager/item-manager.service';
import { PlayerAbandonService } from '@app/services/player-abandon/player-abandon.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { VirtualPlayerLogicService } from '@app/services/virtual-player-logic/virtual-player-logic.service';
import { isPlayerHuman, isTakenTile } from '@app/utils/utilities';
import { GameStatus } from '@common/enums/game-status.enum';
import { Gateway } from '@common/enums/gateway.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { ServerErrorEventsMessages } from '@common/enums/sockets.events/error.events';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { GameStartInformation, PlayerStartPosition } from '@common/interfaces/game-start-info';
import { MoveData } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CLEANUP_MESSAGE, START_MESSAGE } from './game.gateway.constants';

@WebSocketGateway({ namespace: '/game', cors: true })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() private server: Server;
    @Inject() private gameStartService: GameStartService;
    @Inject() private playerMovementService: PlayerMovementService;
    @Inject() private doorTogglingService: DoorOpeningService;
    @Inject() private gameTimeService: GameTimeService;
    @Inject() private gameTurnService: GameTurnService;
    @Inject() private gameEndService: GameEndService;
    @Inject() private playerAbandonService: PlayerAbandonService;
    @Inject() private fightService: FightLogicService;
    @Inject() private roomManagerService: RoomManagerService;
    @Inject() private messagingGateway: MessagingGateway;
    @Inject() private fightManagerService: FightManagerService;
    @Inject() private itemManagerService: ItemManagerService;
    @Inject() private virtualPlayerLogicService: VirtualPlayerLogicService;

    private readonly logger = new Logger(GameGateway.name);

    constructor(private socketManagerService: SocketManagerService) {
        this.socketManagerService.setGatewayServer(Gateway.GAME, this.server);
    }

    @SubscribeMessage(GameEvents.DesireDebugMode)
    desireDebugMode(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);

        if (room) {
            room.game.isDebugMode = !room.game.isDebugMode;
            this.logger.log(`[Game] game ${room.room.roomCode} has now debug: ${room.game.isDebugMode ? 'true' : 'false'}`);
            this.server.to(room.room.roomCode).emit(GameEvents.DebugMode, room.game.isDebugMode);
        }
    }

    @SubscribeMessage(GameEvents.DesireStartGame)
    startGame(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);
        try {
            if (room) {
                const playerName = this.socketManagerService.getSocketPlayerName(socket);
                const player = room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === playerName);

                const playerSpawn: PlayerStartPosition[] = this.gameStartService.startGame(room, player);
                const gameInfo: GameStartInformation = { map: room.game.map, playerStarts: playerSpawn };

                if (playerSpawn) {
                    this.handleGameStart(room, gameInfo, playerSpawn);
                }
            }
        } catch {
            const errorMessage = ServerErrorEventsMessages.errorMessageStartGame;
            this.server.to(room.room.roomCode).emit(GameEvents.ServerError, errorMessage);
        }
    }

    @SubscribeMessage(GameEvents.EndAction)
    endAction(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        try {
            this.gameTurnService.handleEndAction(room, playerName);
        } catch {
            const errorMessage = ServerErrorEventsMessages.errorMessageDesiredEndAction + playerName;
            this.server.to(room.room.roomCode).emit(GameEvents.ServerError, errorMessage);
        }
    }

    @SubscribeMessage(GameEvents.EndTurn)
    endTurn(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        try {
            if (room && playerName) {
                if (room.game.currentPlayer === playerName) {
                    this.gameTurnService.handleChangeTurn(room);
                }
            }
        } catch {
            const errorMessage = ServerErrorEventsMessages.errorMessageDesiredEndTurn + playerName;
            this.server.to(room.room.roomCode).emit(GameEvents.ServerError, errorMessage);
        }
    }

    @SubscribeMessage(GameEvents.DesiredMove)
    processDesiredMove(socket: Socket, destination: Vec2) {
        const roomCode = this.socketManagerService.getSocketRoomCode(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        try {
            const room = this.roomManagerService.getRoom(roomCode);
            if (!room || !playerName) {
                return;
            }
            if (playerName !== room.game.currentPlayer) {
                return;
            }
            this.sendMove(room, destination);
        } catch {
            const errorMessage = ServerErrorEventsMessages.errorMessageDesiredMove + playerName;
            this.server.to(roomCode).emit(GameEvents.ServerError, errorMessage);
        }
    }

    @SubscribeMessage(GameEvents.DesiredDoor)
    processDesiredDoor(socket: Socket, doorPosition: Vec2) {
        const roomCode = this.socketManagerService.getSocketRoomCode(socket);
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        try {
            if (!room || !playerName) {
                return;
            }
            if (playerName !== room.game.currentPlayer) {
                return;
            }
            const player = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
            if (player.playerInGame.remainingActions > 0) {
                const newTileTerrain = this.doorTogglingService.toggleDoor(room, doorPosition);
                player.playerInGame.remainingActions--;
                if (newTileTerrain !== undefined) {
                    this.server.to(roomCode).emit(GameEvents.PlayerDoor, { updatedTileTerrain: newTileTerrain, doorPosition });
                    this.messagingGateway.sendPublicJournal(
                        room,
                        newTileTerrain === TileTerrain.ClosedDoor ? JournalEntry.DoorClose : JournalEntry.DoorOpen,
                    );
                    this.playerMovementService.emitReachableTiles(room);
                }
            }
        } catch {
            const errorMessage = ServerErrorEventsMessages.errorMessageDesiredDoor + playerName;
            this.server.to(roomCode).emit(GameEvents.ServerError, errorMessage);
        }
    }

    @SubscribeMessage(GameEvents.DesireDropItem)
    processDesireItemDrop(socket: Socket, item: ItemType): void {
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        try {
            if (!room || !playerName || playerName !== room.game.currentPlayer) {
                return;
            }
            this.handleItemDrop(room, playerName, item);
            this.endAction(socket);
        } catch {
            const errorMessage = ServerErrorEventsMessages.errorMessageDropItem + playerName;
            this.server.to(room.room.roomCode).emit(GameEvents.ServerError, errorMessage);
        }
    }

    @SubscribeMessage(GameEvents.Abandoned)
    processPlayerAbandonment(socket: Socket): void {
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        try {
            if (!room || !playerName) {
                return;
            }

            this.handlePlayerAbandonment(room, playerName);
        } catch {
            const errorMessage = ServerErrorEventsMessages.errorMessageAbandon + playerName;
            this.server.to(room.room.roomCode).emit(GameEvents.ServerError, errorMessage);
        }
    }

    @SubscribeMessage(GameEvents.DesiredFight)
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
            this.fightManagerService.startFight(room, opponentName);
        } catch {
            const errorMessage = ServerErrorEventsMessages.errorMessageStartFight + playerName;
            this.server.to(room.room.roomCode).emit(GameEvents.ServerError, errorMessage);
        }
    }

    @SubscribeMessage(GameEvents.DesiredAttack)
    processDesiredAttack(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        if (!room || !playerName || !room.game.fight) {
            return;
        }
        try {
            this.fightManagerService.handleDesireAttack(room, playerName);
        } catch {
            const errorMessage = ServerErrorEventsMessages.errorMessageAttack + playerName;
            this.server.to(room.room.roomCode).emit(GameEvents.ServerError, errorMessage);
        }
    }

    @SubscribeMessage(GameEvents.DesiredEvade)
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

    @SubscribeMessage(GameEvents.DesireTeleport)
    processTeleport(socket: Socket, destination: Vec2) {
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        if (!room) return;

        if (room.game.isDebugMode) {
            if (isTakenTile(destination, room.game.map.mapArray, room.players)) {
                return;
            }

            const socketPlayer = room.players.find((player) => player.playerInfo.userName === playerName);
            socketPlayer.playerInGame.currentPosition = destination;
            const moveData: MoveData = { playerId: playerName, destination };
            this.server.to(room.room.roomCode).emit(GameEvents.Teleport, moveData);
            this.playerMovementService.emitReachableTiles(room);
        }
    }

    @SubscribeMessage(GameEvents.EndFightAction)
    processEndFightAction(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        if (!room || !room.game.fight || !playerName) return;
        try {
            this.fightManagerService.handleEndFightAction(room, playerName);
        } catch {
            const errorMessage = ServerErrorEventsMessages.errorEndFightTurn + playerName;
            this.server.to(room.room.roomCode).emit(GameEvents.ServerError, errorMessage);
        }
    }

    handleGameStart(room: RoomGame, gameInfo: GameStartInformation, playerSpawn: PlayerStartPosition[]) {
        this.logger.log('game start');
        const hasRandomItems = room.game.map.placedItems.some((item: Item) => item.type === ItemType.Random);
        if (hasRandomItems) {
            this.itemManagerService.placeRandomItems(room);
        }
        playerSpawn.forEach((start) => {
            gameInfo.map.placedItems.push({ position: start.startPosition, type: ItemType.Start });
        });
        room.players.forEach((roomPlayer) => {
            if (isPlayerHuman(roomPlayer)) {
                const playerGameSocket = this.socketManagerService.getPlayerSocket(room.room.roomCode, roomPlayer.playerInfo.userName, Gateway.GAME);
                playerGameSocket.data.roomCode = room.room.roomCode;
            }
        });
        this.server.to(room.room.roomCode).emit(GameEvents.StartGame, gameInfo);
        this.logger.log(START_MESSAGE + room.room.roomCode);
        room.game.currentPlayer = room.players[room.players.length - 1].playerInfo.userName;
        room.game.timer = this.gameTimeService.getInitialTimer();
        room.game.timer.timerSubscription = this.gameTimeService.getTimerSubject(room.game.timer).subscribe((counter: number) => {
            this.remainingTime(room, counter);
        });
        this.gameTurnService.handleChangeTurn(room);
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
            this.fightManagerService.fightEnd(room);
        }
        player.playerInGame.inventory.forEach((item) => {
            this.itemManagerService.handleItemLost(room, player.playerInfo.userName, player.playerInGame.currentPosition, item, this.server);
        });
        this.server.to(room.room.roomCode).emit(GameEvents.PlayerAbandoned, playerName);
        this.server.emit(GameEvents.DebugMode, room.game.isDebugMode);
        const remainingCount = this.playerAbandonService.getRemainingPlayerCount(room.players);
        if (remainingCount === 0) {
            this.gameCleanup(room);
        } else if (room.game.status !== GameStatus.Finished) {
            if (remainingCount === 1) {
                this.server.to(room.room.roomCode).emit(GameEvents.LastStanding);
            } else if (this.playerAbandonService.hasCurrentPlayerAbandoned(room)) {
                this.gameTurnService.handleChangeTurn(room);
            } else {
                this.playerMovementService.emitReachableTiles(room);
            }
        }
    }

    handleItemPickup(room: RoomGame, playerName: string, hasSlipped: boolean) {
        const player: Player = this.roomManagerService.getPlayerInRoom(room.room.roomCode, playerName);
        const playerTileItem = this.itemManagerService.getPlayerTileItem(room, player);
        const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, playerName, Gateway.GAME);
        if (!this.itemManagerService.isItemGrabbable(playerTileItem.type) || !playerTileItem) return;
        if (!hasSlipped) {
            const isInventoryFull: boolean = this.itemManagerService.isInventoryFull(player);

            if (isInventoryFull) {
                room.game.hasPendingAction = true;
                socket.emit(GameEvents.InventoryFull);
            }
        }
        this.itemManagerService.pickUpItem(room, player, playerTileItem.type);

        this.server
            .to(room.room.roomCode)
            .emit(GameEvents.ItemPickedUp, { newInventory: player.playerInGame.inventory, itemType: playerTileItem.type });
    }

    handleItemDrop(room: RoomGame, playerName: string, itemType: ItemType) {
        const player: Player = this.roomManagerService.getPlayerInRoom(room.room.roomCode, playerName);
        const item = this.itemManagerService.dropItem(room, player, itemType);
        this.server.to(room.room.roomCode).emit(GameEvents.ItemDropped, { playerName, newInventory: player.playerInGame.inventory, item });
    }

    sendMove(room: RoomGame, destination: Vec2) {
        const movementResult = this.playerMovementService.processPlayerMovement(destination, room, false);
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        room.game.hasPendingAction = true;
        const currentPlayerSocket = this.socketManagerService.getPlayerSocket(room.room.roomCode, room.game.currentPlayer, Gateway.GAME);
        this.server.to(room.room.roomCode).emit(GameEvents.PlayerMove, movementResult);
        if (movementResult.isOnItem) {
            this.handleItemPickup(room, currentPlayer.playerInfo.userName, movementResult.hasTripped);
        }
        if (movementResult.hasTripped) {
            if (currentPlayer.playerInGame.inventory.length !== 0) {
                currentPlayer.playerInGame.inventory.forEach((item) => {
                    this.itemManagerService.handleItemLost(
                        room,
                        currentPlayer.playerInfo.userName,
                        currentPlayer.playerInGame.currentPosition,
                        item,
                        this.server,
                    );
                });
            }
            this.server.to(room.room.roomCode).emit(GameEvents.PlayerSlipped, currentPlayer.playerInfo.userName);
            this.endTurn(currentPlayerSocket);
        }
    }

    remainingTime(room: RoomGame, count: number) {
        this.server.to(room.room.roomCode).emit(GameEvents.RemainingTime, count);
        if (room.game.timer.counter === 0) {
            setTimeout(() => {
                if (!room.game.hasPendingAction) {
                    if (room.game.isTurnChange) {
                        this.gameTurnService.handleStartTurn(room);
                    } else {
                        this.gameTurnService.handleChangeTurn(room);
                    }
                }
            }, TIMER_RESOLUTION_MS);
        }
    }

    handleConnection(socket: Socket) {
        this.socketManagerService.registerSocket(socket);
        this.socketManagerService.setGatewayServer(Gateway.GAME, this.server);
    }

    handleDisconnect(socket: Socket) {
        const room = this.roomManagerService.getRoom(socket.data.roomCode);
        const playerName = this.socketManagerService.getDisconnectedPlayerName(socket.data.roomCode, socket);
        if (room && room.game.status !== GameStatus.Waiting && playerName) {
            this.handlePlayerAbandonment(room, playerName);
        }
        this.socketManagerService.unregisterSocket(socket);
    }

    private gameCleanup(room: RoomGame) {
        this.gameTimeService.stopTimer(room.game.timer);
        room.game.timer.timerSubscription.unsubscribe();
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
