import { TIMER_RESOLUTION_MS, TimerDuration } from '@app/constants/time.constants';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { RoomGame } from '@app/interfaces/room-game';
import { ActionService } from '@app/services/action/action.service';
import { FightManagerService } from '@app/services/fight/fight-manager/fight-manager.service';
import { GameEndService } from '@app/services/game-end/game-end.service';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { ItemManagerService } from '@app/services/item/item-manager/item-manager.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { TurnInfoService } from '@app/services/turn-info/turn-info.service';
import {} from '@app/services/virtual-player-behavior/virtual-player-behavior.service';
import { VirtualPlayerStateService } from '@app/services/virtual-player-state/virtual-player-state.service';
import { getAdjacentPositions, isCoordinateWithinBoundaries, isPlayerHuman } from '@app/utils/utilities';
import { GameStatus } from '@common/enums/game-status.enum';
import { Gateway } from '@common/enums/gateway.enum';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
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
    @Inject() private virtualPlayerStateService: VirtualPlayerStateService;
    @Inject() private turnInfoService: TurnInfoService;
    @Inject() private gameStatsService: GameStatsService;
    @Inject() private fightManagerService: FightManagerService;
    @Inject() private itemManagerService: ItemManagerService;
    @Inject() private actionService: ActionService;

    handleEndAction(room: RoomGame) {
        if (room.game.isTurnChange || this.gameEndService.checkForGameEnd(room)) {
            return;
        }

        if (this.isTurnFinished(room)) {
            this.changeTurn(room);
        } else {
            this.resumeTurn(room);
        }
        if (room.game.status === GameStatus.Fight) {
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
            room.game.isCurrentPlayerDead = false;
            this.messagingGateway.sendGenericPublicJournal(room, JournalEntry.TurnStart);
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

    private resumeTurn(room: RoomGame) {
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        if (!isPlayerHuman(currentPlayer)) {
            room.game.virtualState.aiTurnSubject.next();
        } else {
            this.turnInfoService.sendTurnInformation(room);
        }
    }

    private startTurn(room: RoomGame) {
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        room.game.isTurnChange = false;
        this.itemManagerService.addRemovedSpecialItems(room);
        this.gameTimeService.startTimer(room.game.timer, TimerDuration.GameTurn);
        server.to(room.room.roomCode).emit(GameEvents.StartTurn, TimerDuration.GameTurn);
        if (!isPlayerHuman(this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode))) {
            this.virtualPlayerStateService.initiateVirtualPlayerTurn(room);
        }
        this.resumeTurn(room);
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
        return (
            this.hasNoMoreActionsOrMovement(room) ||
            this.hasEndedLateAction(room) ||
            this.fightManagerService.hasLostFight(room) ||
            room.game.isCurrentPlayerDead
        );
    }

    private isAIStuckWithNoActions(room: RoomGame): boolean {
        return (
            this.virtualPlayerStateService.isBeforeObstacle(room) &&
            this.actionService.hasNoPossibleAction(room, this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode))
        );
    }

    private doesAIHaveUnwantedPossibleAction(room: RoomGame): boolean {
        return (
            this.hasNoMovementLeft(this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode)) &&
            !this.virtualPlayerStateService.isBeforeObstacle(room) &&
            this.actionService.isNextToActionTile(room, this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode))
        );
    }

    private isAITurnFinished(room: RoomGame): boolean {
        return (
            this.isAnyTurnFinished(room) ||
            this.isAIStuckWithNoActions(room) ||
            this.virtualPlayerStateService.hasSlipped(room) ||
            this.doesAIHaveUnwantedPossibleAction(room)
        );
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
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        this.turnInfoService.updateCurrentPlayerAttributes(currentPlayer, room.game.map);
        currentPlayer.playerInGame.remainingMovement = currentPlayer.playerInGame.attributes.speed;
        currentPlayer.playerInGame.remainingActions = 1;
        room.game.hasPendingAction = false;
    }

    private hasNoMoreActionsOrMovement(room: RoomGame): boolean {
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode);
        const hasNoActions = this.actionService.hasNoPossibleAction(room, currentPlayer);
        const hasNoMovement = this.hasNoMovementLeft(currentPlayer);

        return hasNoActions && hasNoMovement && (!isPlayerHuman(currentPlayer) || !this.isNextToIce(room, currentPlayer));
    }

    private hasNoMovementLeft(currentPlayer: Player): boolean {
        return currentPlayer.playerInGame.remainingMovement === 0;
    }

    private isNextToIce(room: RoomGame, currentPlayer: Player): boolean {
        return getAdjacentPositions(currentPlayer.playerInGame.currentPosition)
            .filter((pos) => isCoordinateWithinBoundaries(pos, room.game.map.mapArray))
            .some((pos) => this.isIceTile(pos, room));
    }

    private isIceTile(position: Vec2, room: RoomGame): boolean {
        const tile = room.game.map.mapArray[position.y][position.x];
        return tile === TileTerrain.Ice;
    }

    private hasEndedLateAction(room: RoomGame): boolean {
        return room.game.timer.counter === 0 && room.game.hasPendingAction;
    }
}
