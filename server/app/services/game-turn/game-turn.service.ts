import { TIMER_RESOLUTION_MS, TimerDuration } from '@app/constants/time.constants';
import { MAX_AI_ACTION_DELAY, MIN_AI_ACTION_DELAY } from '@app/constants/virtual-player.constants';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { RoomGame } from '@app/interfaces/room-game';
import { GameEndService } from '@app/services/game-end/game-end.service';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { isAnotherPlayerPresentOnTile, isCoordinateWithinBoundaries, isPlayerHuman } from '@app/utils/utilities';
import { GameStatus } from '@common/enums/game-status.enum';
import { Gateway } from '@common/enums/gateway.enum';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { directionToVec2Map } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { VirtualPlayerBehaviorService } from '../virtual-player-behavior/virtual-player-behavior.service';
@Injectable()
export class GameTurnService {
    @Inject() private gameTimeService: GameTimeService;
    @Inject() private playerMovementService: PlayerMovementService;
    @Inject() private messagingGateway: MessagingGateway;
    @Inject() private socketManagerService: SocketManagerService;
    @Inject() private gameEndService: GameEndService;
    @Inject() private roomManagerService: RoomManagerService;
    @Inject() private virtualPlayerService: VirtualPlayerBehaviorService;
    constructor(
        private gameStatsService: GameStatsService,
        private logger: Logger,
    ) { }
    nextTurn(room: RoomGame): string | null {
        this.prepareForNextTurn(room);

        const nextPlayerName = this.findNextCurrentPlayerName(room);

        if (room.game.currentPlayer === nextPlayerName) {
            return null;
        }

        room.game.currentPlayer = nextPlayerName;
        this.gameStatsService.processTurnStats(room.game.stats);

        return nextPlayerName;
    }

    isTurnFinished(room: RoomGame): boolean {
        return this.hasNoMoreActions(room) || this.hasEndedLateAction(room) || this.hasLostFight(room);
    }

    handleEndAction(room: RoomGame, playerName: string) {
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        if (!room || !playerName) {
            return;
        }
        if (playerName !== room.game.currentPlayer) {
            return;
        }
        const endOutput = this.gameEndService.hasGameEnded(room);
        if (endOutput.hasEnded) {
            this.gameEndService.endGame(room, endOutput);
        } else if (this.isTurnFinished(room)) {
            this.handleChangeTurn(room);
        } else {
            this.playerMovementService.emitReachableTiles(room);
        }
        if (room.game.status === GameStatus.Fight) {
            this.gameTimeService.resumeTimer(room.game.timer);
            room.game.fight = null;
            room.game.status = GameStatus.OverWorld;
        }
        room.game.hasPendingAction = false;
    }

    handleChangeTurn(room: RoomGame) {
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        const nextPlayerName = this.nextTurn(room);
        if (nextPlayerName) {
            this.logger.log(server);
            server.to(room.room.roomCode).emit(GameEvents.ChangeTurn, nextPlayerName);
            this.gameTimeService.startTimer(room.game.timer, TimerDuration.GameTurnChange);
            room.game.isTurnChange = true;
            this.messagingGateway.sendPublicJournal(room, JournalEntry.TurnStart);
        }
    }

    handleStartTurn(room: RoomGame) {
        const roomCode = room.room.roomCode;
        const currentPlayer = this.roomManagerService.getPlayerInRoom(roomCode, room.game.currentPlayer);
        room.game.isTurnChange = false;
        if (!isPlayerHuman(currentPlayer)) this.startVirtualPlayerTurn(room, currentPlayer);
        else this.playerMovementService.emitReachableTiles(room);
    }

    startTurn(room: RoomGame) {
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        const roomCode = room.room.roomCode;
        room.game.isTurnChange = false;
        this.playerMovementService.emitReachableTiles(room);
        this.gameTimeService.startTimer(room.game.timer, TimerDuration.GameTurn);
        server.to(roomCode).emit(GameEvents.StartTurn, TimerDuration.GameTurn);
    }

    startVirtualPlayerTurn(room: RoomGame, currentPlayer: Player) {
        // let isStuckInFrontOfDoor = false;
        // let hasSlipped = false;
        // while (!(this.isTurnFinished(room)) && !this.gameEndService.hasGameEnded(room) && !hasSlipped) {
        //     const randomInterval = Math.floor(Math.random() * (MAX_AI_ACTION_DELAY - MIN_AI_ACTION_DELAY + 1)) + MIN_AI_ACTION_DELAY;
        //     const aiPlayerActionOutput = this.virtualPlayerService.executeTurnAIPlayer(room, currentPlayer, isStuckInFrontOfDoor);
        //     hasSlipped = aiPlayerActionOutput.hasSlipped;
        //     isStuckInFrontOfDoor = aiPlayerActionOutput.isStuckInfrontOfDoor;
        //     setTimeout(() => { randomInterval });
        // }
        // const endOutput = this.gameEndService.hasGameEnded(room);
        // if (this.gameEndService.hasGameEnded(room)) {
        //     this.gameEndService.endGame(room, endOutput);
        // } else {
        //     this.handleChangeTurn(room);
        // }

    }
    remainingTime(room: RoomGame, count: number) {
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        server.to(room.room.roomCode).emit(GameEvents.RemainingTime, count);
        if (room.game.timer.counter === 0) {
            setTimeout(() => {
                this.handleTurnChange(room);
            }, TIMER_RESOLUTION_MS);
        }
    }

    private handleTurnChange(room: RoomGame) {
        if (!room.game.hasPendingAction) {
            if (room.game.isTurnChange) {
                this.startTurn(room);
            } else {
                this.handleChangeTurn(room);
            }
        }
    }

    private isNextToActionTile(room: RoomGame): boolean {
        const currentPlayer = room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === room.game.currentPlayer);

        return this.getAdjacentPositions(currentPlayer.playerInGame.currentPosition)
            .filter((pos) => isCoordinateWithinBoundaries(pos, room.game.map.mapArray))
            .some((pos) => this.isActionTile(pos, room));
    }

    private getAdjacentPositions(position: Vec2): Vec2[] {
        return Object.values(directionToVec2Map).map((delta) => ({
            x: position.x + delta.x,
            y: position.y + delta.y,
        }));
    }

    private isActionTile(position: Vec2, room: RoomGame): boolean {
        const tile = room.game.map.mapArray[position.y][position.x];
        return tile === TileTerrain.ClosedDoor || tile === TileTerrain.OpenDoor || isAnotherPlayerPresentOnTile(position, room.players);
    }

    private findNextCurrentPlayerName(room: RoomGame): string {
        const initialCurrentPlayerName = room.game.currentPlayer;
        let nextPlayerIndex = room.players.findIndex((player: Player) => player.playerInfo.userName === room.game.currentPlayer);
        do {
            nextPlayerIndex = (nextPlayerIndex + 1) % room.players.length;
        } while (
            room.players[nextPlayerIndex].playerInGame.hasAbandoned &&
            room.players[nextPlayerIndex].playerInfo.userName !== initialCurrentPlayerName
        );

        return room.players[nextPlayerIndex].playerInfo.userName;
    }

    private prepareForNextTurn(room: RoomGame) {
        const currentPlayer = room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === room.game.currentPlayer);
        currentPlayer.playerInGame.remainingMovement = currentPlayer.playerInGame.attributes.speed;
        currentPlayer.playerInGame.remainingActions = 1;
        room.game.hasPendingAction = false;
    }

    private hasNoMoreActions(room: RoomGame): boolean {
        const currentPlayer = room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === room.game.currentPlayer);
        return (
            currentPlayer.playerInGame.remainingMovement === 0 &&
            (!this.isNextToActionTile(room) || currentPlayer.playerInGame.remainingActions === 0)
        );
    }

    private hasEndedLateAction(room: RoomGame): boolean {
        return room.game.timer.counter === 0 && room.game.hasPendingAction;
    }

    private hasLostFight(room: RoomGame): boolean {
        const currentPlayer = room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === room.game.currentPlayer);
        if (!room.game.fight) {
            return false;
        } else {
            return currentPlayer.playerInfo.userName === room.game.fight.result.loser;
        }
    }
}
