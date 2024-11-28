import { RoomGame } from '@app/interfaces/room-game';
import { FightManagerService } from '@app/services/fight/fight-manager/fight-manager.service';
import { GameEndService } from '@app/services/game-end/game-end.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { isPlayerHuman } from '@app/utils/utilities';
import { GameStatus } from '@common/enums/game-status.enum';
import { Player } from '@common/interfaces/player';
import { Inject, Injectable } from '@nestjs/common';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { TIMER_RESOLUTION_MS, TimerDuration } from '@app/constants/time.constants';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Gateway } from '@common/enums/gateway.enum';
import { TurnInfoService } from '@app/services/turn-info/turn-info.service';
import { ActionService } from '@app/services/action/action.service';
import { VirtualPlayerStateService } from '@app/services/virtual-player-state/virtual-player-state.service';
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
            // TODO this should be in the fight stuff
            if (room.game.status === GameStatus.Fight) this.virtualPlayerStateService.setJustWonFight(room);
            room.game.virtualState.aiTurnSubject.next();
        } else {
            this.turnInfoService.sendTurnInformation(room);
        }
    }

    private startTurn(room: RoomGame) {
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        room.game.isTurnChange = false;
        this.gameTimeService.startTimer(room.game.timer, TimerDuration.GameTurn);
        server.to(room.room.roomCode).emit(GameEvents.StartTurn, TimerDuration.GameTurn);
        if (!isPlayerHuman(this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode))) {
            this.virtualPlayerStateService.initiateVirtualPlayerTurn(room);
        }
        this.resumeTurn(room);
    }

    // private processVirtualPlayerTurn(room: RoomGame, currentPlayer: Player) {
    //     const randomInterval = this.virtualPlayerHelperService.getRandomAIActionInterval();
    //     setTimeout(() => {
    //         this.virtualPlayerService.executeTurnAIPlayer(room, currentPlayer);
    //     }, randomInterval);
    // }

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
        return this.hasNoMoreActionsOrMovement(room) || this.hasEndedLateAction(room) || this.fightManagerService.hasLostFight(room);
    }

    private isAIStuckWithNoActions(room: RoomGame): boolean {
        return (
            room.game.virtualState.isBeforeObstacle &&
            this.actionService.hasNoPossibleAction(room, this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode))
        );
    }

    private doesAIHaveUnwantedPossibleAction(room: RoomGame): boolean {
        return (
            this.hasNoMovementLeft(this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode)) &&
            !room.game.virtualState.isBeforeObstacle &&
            this.actionService.isNextToActionTile(room, this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode))
        );
    }

    private isAITurnFinished(room: RoomGame): boolean {
        return (
            this.isAnyTurnFinished(room) ||
            this.isAIStuckWithNoActions(room) ||
            room.game.virtualState.hasSlipped ||
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
        return this.actionService.hasNoPossibleAction(room, currentPlayer) && this.hasNoMovementLeft(currentPlayer);
    }

    // TODO accomodate for adjacent ice tiles
    private hasNoMovementLeft(currentPlayer: Player): boolean {
        return currentPlayer.playerInGame.remainingMovement === 0;
    }

    private hasEndedLateAction(room: RoomGame): boolean {
        return room.game.timer.counter === 0 && room.game.hasPendingAction;
    }
}
