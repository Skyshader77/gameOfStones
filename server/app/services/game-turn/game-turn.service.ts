import { TIMER_RESOLUTION_MS, TimerDuration } from '@app/constants/time.constants';
import { MAX_AI_ACTION_DELAY, MIN_AI_ACTION_DELAY } from '@app/constants/virtual-player.constants';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { RoomGame } from '@app/interfaces/room-game';
import { GameEndService } from '@app/services/game-end/game-end.service';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { TurnInfoService } from '@app/services/turn-info/turn-info.service';
import { VirtualPlayerBehaviorService } from '@app/services/virtual-player-behavior/virtual-player-behavior.service';
import { isAnotherPlayerPresentOnTile, isCoordinateWithinBoundaries, isPlayerHuman } from '@app/utils/utilities';
import { GameStatus } from '@common/enums/game-status.enum';
import { Gateway } from '@common/enums/gateway.enum';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { directionToVec2Map } from '@common/interfaces/move';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Injectable } from '@nestjs/common';
@Injectable()
export class GameTurnService {
    @Inject() private gameTimeService: GameTimeService;
    @Inject() private messagingGateway: MessagingGateway;
    @Inject() private socketManagerService: SocketManagerService;
    @Inject() private gameEndService: GameEndService;
    @Inject() private roomManagerService: RoomManagerService;
    @Inject() private virtualPlayerService: VirtualPlayerBehaviorService;
    @Inject() private turnInfoService: TurnInfoService;
    @Inject() private gameStatsService: GameStatsService;

    handleEndAction(room: RoomGame, playerName: string) {
        if (!room || !playerName || room.game.isTurnChange || this.checkForGameEnd(room)) {
            return;
        }

        if (this.isTurnFinished(room)) {
            this.changeTurn(room);
        } else if (!isPlayerHuman(this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode))) {
            this.processVirtualPlayerTurn(room, this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode));
        } else {
            this.turnInfoService.sendTurnInformation(room);
        }
        if (room.game.status === GameStatus.Fight) {
            this.virtualPlayerService.setJustWonFight(room.room.roomCode);
            this.gameTimeService.resumeTimer(room.game.timer);
            room.game.fight = null;
            room.game.status = GameStatus.OverWorld;
        }
        room.game.hasPendingAction = false;
    }

    changeTurn(room: RoomGame) {
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        const nextPlayerName = this.nextTurn(room);
        if (nextPlayerName) {
            server.to(room.room.roomCode).emit(GameEvents.ChangeTurn, nextPlayerName);
            this.gameTimeService.startTimer(room.game.timer, TimerDuration.GameTurnChange);
            room.game.isTurnChange = true;
            this.messagingGateway.sendPublicJournal(room, JournalEntry.TurnStart);
        }
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

    private startTurn(room: RoomGame) {
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        const roomCode = room.room.roomCode;
        const currentPlayer = this.roomManagerService.getPlayerInRoom(roomCode, room.game.currentPlayer);
        room.game.isTurnChange = false;
        this.gameTimeService.startTimer(room.game.timer, TimerDuration.GameTurn);
        server.to(roomCode).emit(GameEvents.StartTurn, TimerDuration.GameTurn);
        if (!isPlayerHuman(currentPlayer) && this.roomManagerService.getRoom(room.room.roomCode)) {
            this.turnInfoService.updateCurrentPlayerAttributes(currentPlayer, room.game.map);
            this.startVirtualPlayerTurn(room, currentPlayer);
        } else this.turnInfoService.sendTurnInformation(room);
    }

    private startVirtualPlayerTurn(room: RoomGame, currentPlayer: Player) {
        this.virtualPlayerService.initiateVirtualPlayerTurn(room.room.roomCode);

        this.processVirtualPlayerTurn(room, currentPlayer);
    }

    private processVirtualPlayerTurn(room: RoomGame, currentPlayer: Player) {
        const randomInterval = this.getRandomInterval();
        setTimeout(() => {
            if (!this.roomManagerService.getRoom(room.room.roomCode)) {
                return;
            }
            this.virtualPlayerService.executeTurnAIPlayer(room, currentPlayer);
        }, randomInterval);
    }

    private getRandomInterval() {
        return Math.floor(Math.random() * (MAX_AI_ACTION_DELAY - MIN_AI_ACTION_DELAY)) + MIN_AI_ACTION_DELAY; // Example: 500-1500ms
    }

    private nextTurn(room: RoomGame): string | null {
        this.prepareForNextTurn(room);

        const nextPlayerName = this.findNextCurrentPlayerName(room);

        if (room.game.currentPlayer === nextPlayerName) {
            return null;
        }

        room.game.currentPlayer = nextPlayerName;
        this.gameStatsService.processTurnStats(room.game.stats);

        return nextPlayerName;
    }

    private isTurnFinished(room: RoomGame): boolean {
        return isPlayerHuman(this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode))
            ? this.isAnyTurnFinished(room)
            : this.isAITurnFinished(room);
    }

    private isAnyTurnFinished(room: RoomGame): boolean {
        return this.hasNoMoreActionsOrMovement(room) || this.hasEndedLateAction(room) || this.hasLostFight(room);
    }

    private isAIStuckWithNoActions(room: RoomGame): boolean {
        return (
            this.virtualPlayerService.getRoomVirtualPlayerState(room.room.roomCode).isBeforeObstacle &&
            !this.hasPossibleAction(room, this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode))
        );
    }

    private hasUnwantedPossibleAction(room: RoomGame): boolean {
        return (
            !this.hasMovementLeft(this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode)) &&
            !this.virtualPlayerService.getRoomVirtualPlayerState(room.room.roomCode).isBeforeObstacle &&
            this.isNextToActionTile(room, this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode))
        );
    }

    private isAnyAITurnFinished(room: RoomGame): boolean {
        return (
            this.isAnyTurnFinished(room) ||
            this.isAIStuckWithNoActions(room) ||
            this.virtualPlayerService.getRoomVirtualPlayerState(room.room.roomCode).hasSlipped
        );
    }

    private isDefensiveAITurnFinished(room: RoomGame): boolean {
        return this.isAnyAITurnFinished(room) || this.hasUnwantedPossibleAction(room);
    }

    private isAITurnFinished(room: RoomGame): boolean {
        return this.roomManagerService.getCurrentPlayerRole(room) === PlayerRole.AggressiveAI
            ? this.isAnyAITurnFinished(room)
            : this.isDefensiveAITurnFinished(room);
    }

    private handleTurnChange(room: RoomGame) {
        if (!room.game.hasPendingAction) {
            if (room.game.isTurnChange) {
                this.startTurn(room);
            } else {
                this.changeTurn(room);
            }
        }
    }

    private isNextToActionTile(room: RoomGame, currentPlayer: Player): boolean {
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
        return isPlayerHuman(this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode))
            ? tile === TileTerrain.ClosedDoor || tile === TileTerrain.OpenDoor || isAnotherPlayerPresentOnTile(position, room.players)
            : tile === TileTerrain.ClosedDoor || isAnotherPlayerPresentOnTile(position, room.players);
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
        this.turnInfoService.updateCurrentPlayerAttributes(currentPlayer, room.game.map);
        currentPlayer.playerInGame.remainingMovement = currentPlayer.playerInGame.attributes.speed;
        currentPlayer.playerInGame.remainingActions = 1;
        room.game.hasPendingAction = false;
    }

    private hasNoMoreActionsOrMovement(room: RoomGame): boolean {
        const currentPlayer = room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === room.game.currentPlayer);
        return !this.hasPossibleAction(room, currentPlayer) && !this.hasMovementLeft(currentPlayer);
    }

    private hasMovementLeft(currentPlayer: Player): boolean {
        return currentPlayer.playerInGame.remainingMovement !== 0;
    }

    private hasPossibleAction(room: RoomGame, currentPlayer: Player): boolean {
        return this.isNextToActionTile(room, currentPlayer) && currentPlayer.playerInGame.remainingActions !== 0;
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

    private checkForGameEnd(room: RoomGame): boolean {
        const endOutput = this.gameEndService.hasGameEnded(room);
        if (endOutput.hasEnded) {
            this.gameEndService.endGame(room, endOutput);
        }
        return endOutput.hasEnded;
    }
}
