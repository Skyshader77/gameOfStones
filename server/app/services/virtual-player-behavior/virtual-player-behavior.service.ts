import { ClosestObject, ClosestObjectData, VirtualPlayerState, VirtualPlayerTurnData } from '@app/interfaces/ai-state';
import { RoomGame } from '@app/interfaces/room-game';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { GameMode } from '@common/enums/game-mode.enum';
import { DEFENSIVE_ITEMS, ItemType, OFFENSIVE_ITEMS } from '@common/enums/item-type.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Injectable } from '@nestjs/common';
import { PathFindingService } from '@app/services/pathfinding/pathfinding.service';
import { FightGateway } from '@app/gateways/fight/fight.gateway';
import { GameGateway } from '@app/gateways/game/game.gateway';
import { VirtualPlayerHelperService } from '@app/services/virtual-player-helper/virtual-player-helper.service';
import { VirtualPlayerStateService } from '@app/services/virtual-player-state/virtual-player-state.service';

@Injectable()
export class VirtualPlayerBehaviorService {
    @Inject() private roomManagerService: RoomManagerService;
    @Inject() private gameGateway: GameGateway;
    @Inject() private fightGateway: FightGateway;
    @Inject() private pathFindingService: PathFindingService;
    @Inject() private virtualPlayerHelperService: VirtualPlayerHelperService;
    @Inject() private virtualPlayerStateService: VirtualPlayerStateService;

    initializeRoomForVirtualPlayers(room: RoomGame) {
        if (!room.game.virtualState.aiTurnSubscription) {
            room.game.virtualState.aiTurnSubscription = room.game.virtualState.aiTurnSubject.asObservable().subscribe(() => {
                this.executeTurnAIPlayer(room, this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode));
            });
        }
    }

    executeTurnAIPlayer(room: RoomGame, virtualPlayer: Player) {
        setTimeout(() => {
            if (room && room.game.currentPlayer === virtualPlayer.playerInfo.userName) {
                this.determineTurnAction(room, virtualPlayer);
            }
        }, this.virtualPlayerHelperService.getRandomAIActionInterval());
    }

    private determineTurnAction(room: RoomGame, virtualPlayer: Player) {
        const virtualPlayerState = this.virtualPlayerStateService.getVirtualState(room);
        const closestPlayer = this.pathFindingService.getNearestPlayerPosition(room, virtualPlayer.playerInGame.currentPosition);
        const closestItem = this.pathFindingService.getNearestItemPosition(room, virtualPlayer.playerInGame.currentPosition);
        const closestObjectData: ClosestObjectData = { closestPlayer, closestItem };
        const virtualPlayerTurnData: VirtualPlayerTurnData = { closestObjectData, room, virtualPlayer, virtualPlayerState };

        if (virtualPlayer.playerInfo.role === PlayerRole.AggressiveAI) {
            virtualPlayerState.isSeekingPlayers = true;
            this.offensiveTurnAction(virtualPlayerTurnData);
        } else if (virtualPlayer.playerInfo.role === PlayerRole.DefensiveAI) {
            if (!this.virtualPlayerHelperService.remainingDefensiveItemCount(room)) virtualPlayerState.isSeekingPlayers = true;
            this.defensiveTurnAction(virtualPlayerTurnData);
        }
    }

    private offensiveTurnAction(turnData: VirtualPlayerTurnData) {
        const { closestObjectData, room, virtualPlayer, virtualPlayerState } = turnData;
        const closestOffensiveItem = this.pathFindingService.getNearestItemPosition(
            room,
            virtualPlayer.playerInGame.currentPosition,
            OFFENSIVE_ITEMS,
        );

        if (this.canFight(virtualPlayer, closestObjectData.closestPlayer.position)) {
            this.initiateFight(closestObjectData.closestPlayer.position, room, virtualPlayerState);
        } else if (this.shouldOpenDoor(virtualPlayer, virtualPlayerState)) {
            this.gameGateway.togglePlayerDoor(room, virtualPlayerState.obstacle);
        } else if (this.hasFlag(virtualPlayer, room)) {
            this.moveToStartingPosition(virtualPlayer, room);
        } else if (this.isClosestPlayerReachable(virtualPlayer, closestObjectData.closestPlayer) && !virtualPlayerState.justWonFight) {
            this.gameGateway.sendMove(room, closestObjectData.closestPlayer.position, true);
        } else if (closestOffensiveItem && this.isClosestOffensiveItemReachable(virtualPlayer, closestOffensiveItem)) {
            this.gameGateway.sendMove(room, closestOffensiveItem.position, false);
        } else if (!this.isNextToOtherPlayer(closestObjectData.closestPlayer.position, virtualPlayer.playerInGame.currentPosition)) {
            this.gameGateway.sendMove(room, closestObjectData.closestPlayer.position, true);
        } else {
            this.gameGateway.endPlayerTurn(room);
        }
    }

    private defensiveTurnAction(turnData: VirtualPlayerTurnData) {
        const { closestObjectData, room, virtualPlayer, virtualPlayerState } = turnData;
        const closestDefensiveItem = this.pathFindingService.getNearestItemPosition(
            room,
            virtualPlayer.playerInGame.currentPosition,
            DEFENSIVE_ITEMS,
        );
        if (this.hasToFight(virtualPlayer, closestObjectData.closestPlayer.position, virtualPlayerState)) {
            this.initiateFight(closestObjectData.closestPlayer.position, room, virtualPlayerState);
        } else if (this.shouldOpenDoor(virtualPlayer, virtualPlayerState)) {
            this.gameGateway.togglePlayerDoor(room, virtualPlayerState.obstacle);
        } else if (this.hasFlag(virtualPlayer, room)) {
            this.moveToStartingPosition(virtualPlayer, room);
        } else if (
            this.doesClosestItemExist(closestDefensiveItem) &&
            !this.hasJustEvadedAndBlocked(closestObjectData, virtualPlayer, virtualPlayerState)
        ) {
            this.gameGateway.sendMove(room, closestDefensiveItem.position, true);
        } else if (
            this.doesClosestItemExist(closestObjectData.closestItem) &&
            !this.hasJustEvadedAndBlocked(closestObjectData, virtualPlayer, virtualPlayerState)
        ) {
            this.gameGateway.sendMove(room, closestObjectData.closestItem.position, true);
        } else if (this.canFight(virtualPlayer, closestObjectData.closestPlayer.position)) {
            this.initiateFight(closestObjectData.closestPlayer.position, room, virtualPlayerState);
        } else if (!this.isNextToOtherPlayer(closestObjectData.closestPlayer.position, virtualPlayer.playerInGame.currentPosition)) {
            this.gameGateway.sendMove(room, closestObjectData.closestPlayer.position, true);
        } else {
            this.gameGateway.endPlayerTurn(room);
        }
    }

    private hasJustEvadedAndBlocked(closestObjectData: ClosestObjectData, virtualPlayer: Player, virtualPlayerState: VirtualPlayerState) {
        return (
            this.isNextToOtherPlayer(closestObjectData.closestPlayer.position, virtualPlayer.playerInGame.currentPosition) &&
            virtualPlayerState.justWonFight
        );
    }

    private doesClosestItemExist(closestItem: ClosestObject) {
        return closestItem && closestItem.position;
    }

    private isClosestPlayerReachable(virtualPlayer: Player, closestPlayer: ClosestObject) {
        return virtualPlayer.playerInGame.remainingMovement >= closestPlayer.cost;
    }

    private isClosestOffensiveItemReachable(virtualPlayer: Player, closestItem: ClosestObject) {
        return virtualPlayer.playerInGame.remainingMovement >= closestItem.cost;
    }

    private initiateFight(closestPlayerPosition: Vec2, room: RoomGame, virtualPlayerState: VirtualPlayerState) {
        const opponentName = this.findPlayerAtPosition(closestPlayerPosition, room);
        virtualPlayerState.obstacle = null;
        this.fightGateway.startFight(room, opponentName);
    }

    private canFight(virtualPlayer: Player, closestPlayerPosition: Vec2): boolean {
        return (
            virtualPlayer.playerInGame.remainingActions > 0 &&
            this.isNextToOtherPlayer(closestPlayerPosition, virtualPlayer.playerInGame.currentPosition)
        );
    }

    private hasToFight(virtualPlayer: Player, closestPlayerPosition: Vec2, virtualPlayerState: VirtualPlayerState): boolean {
        return virtualPlayerState.obstacle && this.canFight(virtualPlayer, closestPlayerPosition);
    }

    private shouldOpenDoor(virtualPlayer: Player, virtualPlayerState: VirtualPlayerState) {
        return virtualPlayerState.obstacle && virtualPlayer.playerInGame.remainingActions > 0;
    }

    private hasFlag(virtualPlayer: Player, room: RoomGame) {
        return room.game.mode === GameMode.CTF && virtualPlayer.playerInGame.inventory.includes(ItemType.Flag);
    }

    private moveToStartingPosition(virtualPlayer: Player, room: RoomGame) {
        const playerStartPosition = virtualPlayer.playerInGame.startPosition;
        this.gameGateway.sendMove(room, playerStartPosition, true);
    }

    private isNextToOtherPlayer(closestPlayerPosition: Vec2, currentPlayerPosition: Vec2): boolean {
        const dx = Math.abs(closestPlayerPosition.x - currentPlayerPosition.x);
        const dy = Math.abs(closestPlayerPosition.y - currentPlayerPosition.y);

        return dx + dy === 1;
    }

    private findPlayerAtPosition(opponentPosition: Vec2, room: RoomGame): string {
        for (const player of room.players) {
            if (player.playerInGame.currentPosition.x === opponentPosition.x && player.playerInGame.currentPosition.y === opponentPosition.y) {
                return player.playerInfo.userName;
            }
        }
        return null;
    }
}
