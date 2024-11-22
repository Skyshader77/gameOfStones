import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { Item } from '@app/interfaces/item';
import { RoomGame } from '@app/interfaces/room-game';
import { DoorOpeningService } from '@app/services/door-opening/door-opening.service';
import { FightManagerService } from '@app/services/fight/fight/fight-manager.service';
import { GameStartService } from '@app/services/game-start/game-start.service';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { GameTurnService } from '@app/services/game-turn/game-turn.service';
import { ItemManagerService } from '@app/services/item-manager/item-manager.service';
import { PlayerAbandonService } from '@app/services/player-abandon/player-abandon.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { TurnInfoService } from '@app/services/turn-info/turn-info.service';
import { isPlayerHuman, isTakenTile } from '@app/utils/utilities';
import { GameStatus } from '@common/enums/game-status.enum';
import { Gateway } from '@common/enums/gateway.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { GameStartInformation, PlayerStartPosition } from '@common/interfaces/game-start-info';
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
    @Inject() private socketManagerService: SocketManagerService;
    @Inject() private turnInfoService: TurnInfoService;

    private readonly logger = new Logger(GameGateway.name);

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
            this.logger.log('error in start game');
        }
    }

    @SubscribeMessage(GameEvents.EndAction)
    endAction(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        try {
            console.log('end action');
            this.gameTurnService.handleEndAction(room, playerName);
        } catch {
            this.logger.log('error in end action');
        }
    }

    @SubscribeMessage(GameEvents.EndTurn)
    endTurn(socket: Socket) {
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        try {
            if (room && playerName) {
                if (room.game.currentPlayer === playerName) {
                    this.gameTurnService.changeTurn(room);
                }
            }
        } catch {
            this.logger.log('error in end turn');
        }
    }

    @SubscribeMessage(GameEvents.DesireMove)
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
            this.logger.log('error in desire move');
        }
    }

    @SubscribeMessage(GameEvents.DesireToggleDoor)
    processDesiredDoor(socket: Socket, doorPosition: Vec2) {
        const roomCode = this.socketManagerService.getSocketRoomCode(socket);
        const room = this.socketManagerService.getSocketRoom(socket);
        const playerName = this.socketManagerService.getSocketPlayerName(socket);
        try {
            console.log('received door');
            if (!room || !playerName) {
                return;
            }
            if (playerName !== room.game.currentPlayer) {
                return;
            }
            const player = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
            if (player.playerInGame.remainingActions > 0) {
                room.game.hasPendingAction = true;
                const newTileTerrain = this.doorTogglingService.toggleDoor(room, doorPosition);
                player.playerInGame.remainingActions--;
                if (newTileTerrain !== undefined) {
                    this.server.to(roomCode).emit(GameEvents.PlayerDoor, { updatedTileTerrain: newTileTerrain, doorPosition });
                    this.messagingGateway.sendPublicJournal(
                        room,
                        newTileTerrain === TileTerrain.ClosedDoor ? JournalEntry.DoorClose : JournalEntry.DoorOpen,
                    );
                    this.turnInfoService.sendTurnInformation(room);
                }
            }
        } catch {
            this.logger.log('error in desired door');
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
            this.itemManagerService.handleItemDrop(room, playerName, item);
            this.endAction(socket);
        } catch {
            this.logger.log('error in desire item drop');
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
            this.logger.log('error in player abandon');
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
            this.turnInfoService.sendTurnInformation(room);
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
                const playerGameSocket = this.socketManagerService.getPlayerSocket(room.room.roomCode, roomPlayer.playerInfo.userName, Gateway.Game);
                playerGameSocket.data.roomCode = room.room.roomCode;
            }
        });
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
            this.fightManagerService.fightEnd(room);
        }
        player.playerInGame.inventory.forEach((item) => {
            this.itemManagerService.handleItemLost({
                room,
                playerName: player.playerInfo.userName,
                itemDropPosition: player.playerInGame.currentPosition,
                itemType: item,
            });
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
                this.gameTurnService.changeTurn(room);
            } else {
                this.turnInfoService.sendTurnInformation(room);
            }
        }
    }

    sendMove(room: RoomGame, destination: Vec2) {
        const movementResult = this.playerMovementService.executePlayerMovement(destination, room, false);
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        room.game.hasPendingAction = true;
        const currentPlayerSocket = this.socketManagerService.getPlayerSocket(room.room.roomCode, room.game.currentPlayer, Gateway.Game);
        this.server.to(room.room.roomCode).emit(GameEvents.PlayerMove, movementResult);
        if (movementResult.isOnItem) {
            this.itemManagerService.handleItemPickup(room, currentPlayer.playerInfo.userName, movementResult.hasTripped);
        }
        if (movementResult.hasTripped) {
            this.server.to(room.room.roomCode).emit(GameEvents.PlayerSlipped, currentPlayer.playerInfo.userName);
            this.endTurn(currentPlayerSocket);
        } else if (movementResult.optimalPath.remainingMovement > 0) {
            this.turnInfoService.sendTurnInformation(room);
        }
    }

    afterInit() {
        this.socketManagerService.setGatewayServer(Gateway.Game, this.server);
    }

    handleConnection(socket: Socket) {
        this.socketManagerService.registerSocket(socket);
        this.socketManagerService.setGatewayServer(Gateway.Game, this.server);
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
