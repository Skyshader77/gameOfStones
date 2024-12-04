import { AI_BLOWUP_WITH_FLAG_PROB } from '@app/constants/virtual-player.constants';
import { FightGateway } from '@app/gateways/fight/fight.gateway';
import { GameGateway } from '@app/gateways/game/game.gateway';
import { AIStrategy, ClosestObject, ClosestObjectData, ClosestObjects, VirtualPlayerState, VirtualPlayerTurnData } from '@app/interfaces/ai-state';
import { RoomGame } from '@app/interfaces/room-game';
import { ErrorMessageService } from '@app/services/error-message/error-message.service';
import { SpecialItemService } from '@app/services/item/special-item/special-item.service';
import { PathFindingService } from '@app/services/pathfinding/pathfinding.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { VirtualPlayerHelperService } from '@app/services/virtual-player-helper/virtual-player-helper.service';
import { VirtualPlayerStateService } from '@app/services/virtual-player-state/virtual-player-state.service';
import { findPlayerAtPosition } from '@app/utils/utilities';
import { GameMode } from '@common/enums/game-mode.enum';
import { DEFENSIVE_ITEMS, ItemType, OFFENSIVE_ITEMS } from '@common/enums/item-type.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { ItemUsedPayload } from '@common/interfaces/item';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class VirtualPlayerBehaviorService {
    @Inject() private roomManagerService: RoomManagerService;
    @Inject() private gameGateway: GameGateway;
    @Inject() private fightGateway: FightGateway;
    @Inject() private pathFindingService: PathFindingService;
    @Inject() private virtualPlayerHelperService: VirtualPlayerHelperService;
    @Inject() private virtualPlayerStateService: VirtualPlayerStateService;
    @Inject() private errorMessageService: ErrorMessageService;
    @Inject() private specialItemService: SpecialItemService;

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
        try {
            const virtualPlayerState = this.virtualPlayerStateService.getVirtualState(room.game);

            const closestObjectData = this.getClosestObjectData(room, virtualPlayer);
            const virtualPlayerTurnData: VirtualPlayerTurnData = { closestObjectData, room, virtualPlayer, virtualPlayerState };

            if (virtualPlayer.playerInfo.role === PlayerRole.AggressiveAI) {
                this.offensiveTurnAction(virtualPlayerTurnData);
            } else if (virtualPlayer.playerInfo.role === PlayerRole.DefensiveAI) {
                this.defensiveTurnAction(virtualPlayerTurnData);
            }
        } catch (error) {
            this.errorMessageService.aiError(error);
        }
    }

    private getClosestObjectData(room: RoomGame, virtualPlayer: Player) {
        this.virtualPlayerStateService.setIsSeekingPlayers(room.game, true);
        const closestPlayer = this.pathFindingService.getNearestPlayerPosition(room, virtualPlayer.playerInGame.currentPosition);
        this.virtualPlayerStateService.setIsSeekingPlayers(room.game, false);
        const closestItem = this.pathFindingService.getNearestItemPosition(room, virtualPlayer.playerInGame.currentPosition);
        return { closestPlayer, closestItem };
    }

    private offensiveTurnAction(turnData: VirtualPlayerTurnData) {
        const { closestObjectData, room, virtualPlayer } = turnData;

        this.virtualPlayerStateService.setIsSeekingPlayers(room.game, false);
        const closestOffensiveItem = this.getClosestPreferentialItem(room, virtualPlayer);

        const actionStrategies = [
            this.createBombStrategy(virtualPlayer, room),
            this.createFightStrategy(virtualPlayer, closestObjectData, room),
            this.createHammerStrategy(virtualPlayer, closestObjectData, room),
            this.createDoorStrategy(virtualPlayer, room),
            this.createFlagStrategy(virtualPlayer, room),
            this.createMoveToPlayerStrategy(virtualPlayer, closestObjectData, room),
            this.createReachableItemStrategy(virtualPlayer, closestOffensiveItem, room),
            this.createAlternateMoveToPlayerStrategy(virtualPlayer, closestObjectData, room),
        ];

        for (const strategy of actionStrategies) {
            if (strategy()) {
                return;
            }
        }

        this.gameGateway.endPlayerTurn(room);
    }

    private defensiveTurnAction(turnData: VirtualPlayerTurnData) {
        const { closestObjectData, room, virtualPlayer } = turnData;

        this.virtualPlayerStateService.setIsSeekingPlayers(room.game, false);
        const closestDefensiveItem = this.getClosestPreferentialItem(room, virtualPlayer);

        const actionStrategies = [
            this.createForcedFightStrategy(virtualPlayer, closestObjectData, room),
            this.createDoorStrategy(virtualPlayer, room),
            this.createFlagStrategy(virtualPlayer, room),
            this.createReachableItemStrategy(virtualPlayer, closestDefensiveItem, room),
            this.createReachableItemStrategy(virtualPlayer, closestObjectData.closestItem, room),
            this.createApproachItemStrategy(room, { preferred: closestDefensiveItem, default: closestObjectData.closestItem }, virtualPlayer),
            this.createBombStrategy(virtualPlayer, room),
            this.createHammerStrategy(virtualPlayer, closestObjectData, room),
            this.createFightStrategy(virtualPlayer, closestObjectData, room),
            this.createMoveToPlayerStrategy(virtualPlayer, closestObjectData, room),
        ];

        for (const strategy of actionStrategies) {
            if (strategy()) {
                return;
            }
        }

        this.gameGateway.endPlayerTurn(room);
    }

    private getClosestPreferentialItem(room: RoomGame, virtualPlayer: Player) {
        return this.pathFindingService.getNearestItemPosition(
            room,
            virtualPlayer.playerInGame.currentPosition,
            virtualPlayer.playerInfo.role === PlayerRole.AggressiveAI ? OFFENSIVE_ITEMS : DEFENSIVE_ITEMS,
        );
    }

    private createAlternateMoveToPlayerStrategy(virtualPlayer: Player, closestObjectData: ClosestObjectData, room: RoomGame): AIStrategy {
        return () => {
            if (!this.isNextToOtherPlayer(closestObjectData.closestPlayer.position, virtualPlayer.playerInGame.currentPosition)) {
                this.virtualPlayerStateService.setIsSeekingPlayers(room.game, true);
                this.gameGateway.sendMove(room, closestObjectData.closestPlayer.position);
                return true;
            }
            return false;
        };
    }

    private createBombStrategy(virtualPlayer: Player, room: RoomGame): AIStrategy {
        return () => {
            if (
                this.hasBomb(virtualPlayer) &&
                this.specialItemService.areAnyPlayersInBombRange(virtualPlayer.playerInGame.currentPosition, room.game.map, room) &&
                this.doesExplodeWithFlag(virtualPlayer, room)
            ) {
                const itemUsedPayload: ItemUsedPayload = {
                    usagePosition: virtualPlayer.playerInGame.currentPosition,
                    type: ItemType.GeodeBomb,
                };
                this.gameGateway.useSpecialItem(room, virtualPlayer.playerInfo.userName, itemUsedPayload);
                return true;
            }
            return false;
        };
    }

    private createHammerStrategy(virtualPlayer: Player, closestObjectData: ClosestObjectData, room: RoomGame): AIStrategy {
        return () => {
            if (
                this.hasHammer(virtualPlayer) &&
                this.isNextToOtherPlayer(virtualPlayer.playerInGame.currentPosition, closestObjectData.closestPlayer.position)
            ) {
                const itemUsedPayload: ItemUsedPayload = {
                    usagePosition: closestObjectData.closestPlayer.position,
                    type: ItemType.GraniteHammer,
                };
                this.gameGateway.useSpecialItem(room, virtualPlayer.playerInfo.userName, itemUsedPayload);
                return true;
            }
            return false;
        };
    }

    private createForcedFightStrategy(virtualPlayer: Player, closestObjectData: ClosestObjectData, room: RoomGame): AIStrategy {
        return () => {
            if (this.hasToFight(virtualPlayer, closestObjectData.closestPlayer.position, this.virtualPlayerStateService.getVirtualState(room.game))) {
                this.initiateFight(closestObjectData.closestPlayer.position, room, this.virtualPlayerStateService.getVirtualState(room.game));
                return true;
            }
            return false;
        };
    }

    private createDoorStrategy(virtualPlayer: Player, room: RoomGame): AIStrategy {
        return () => {
            if (this.shouldOpenDoor(virtualPlayer, this.virtualPlayerStateService.getVirtualState(room.game))) {
                this.gameGateway.togglePlayerDoor(room, this.virtualPlayerStateService.getVirtualState(room.game).obstacle);
                return true;
            }
            return false;
        };
    }

    private createFlagStrategy(virtualPlayer: Player, room: RoomGame): AIStrategy {
        return () => {
            if (this.hasFlag(virtualPlayer, room)) {
                this.moveToStartingPosition(virtualPlayer, room);
                return true;
            }
            return false;
        };
    }

    private createReachableItemStrategy(virtualPlayer: Player, closestObject: ClosestObject, room: RoomGame): AIStrategy {
        return () => {
            if (
                this.doesClosestItemExist(closestObject) &&
                this.isClosestItemReachable(virtualPlayer, closestObject) &&
                !this.isBlocked(virtualPlayer, this.virtualPlayerStateService.getVirtualState(room.game))
            ) {
                this.gameGateway.sendMove(room, closestObject.position);
                return true;
            }
            return false;
        };
    }

    private createApproachItemStrategy(room: RoomGame, closestObjects: ClosestObjects, virtualPlayer: Player): AIStrategy {
        return () => {
            if (
                (this.doesClosestItemExist(closestObjects.preferred) || this.doesClosestItemExist(closestObjects.default)) &&
                !this.isBlocked(virtualPlayer, this.virtualPlayerStateService.getVirtualState(room.game))
            ) {
                const closest = this.doesClosestItemExist(closestObjects.preferred) ? closestObjects.preferred : closestObjects.default;
                this.gameGateway.sendMove(room, closest.position);
                return true;
            }
            return false;
        };
    }

    private createFightStrategy(virtualPlayer: Player, closestObjectData: ClosestObjectData, room: RoomGame): AIStrategy {
        return () => {
            if (this.canFight(virtualPlayer, closestObjectData.closestPlayer.position)) {
                this.initiateFight(closestObjectData.closestPlayer.position, room, this.virtualPlayerStateService.getVirtualState(room.game));
                return true;
            }
            return false;
        };
    }

    private createMoveToPlayerStrategy(virtualPlayer: Player, closestObjectData: ClosestObjectData, room: RoomGame): AIStrategy {
        return () => {
            if (
                !this.isNextToOtherPlayer(closestObjectData.closestPlayer.position, virtualPlayer.playerInGame.currentPosition) &&
                !this.isBlocked(virtualPlayer, this.virtualPlayerStateService.getVirtualState(room.game))
            ) {
                this.virtualPlayerStateService.setIsSeekingPlayers(room.game, true);
                this.gameGateway.sendMove(room, closestObjectData.closestPlayer.position);
                return true;
            }
            return false;
        };
    }

    private doesClosestItemExist(closestItem: ClosestObject) {
        return closestItem && closestItem.position;
    }

    private isClosestItemReachable(virtualPlayer: Player, closestItem: ClosestObject) {
        return virtualPlayer.playerInGame.remainingMovement >= closestItem.cost;
    }

    private initiateFight(closestPlayerPosition: Vec2, room: RoomGame, virtualPlayerState: VirtualPlayerState) {
        const opponentName = findPlayerAtPosition(closestPlayerPosition, room).playerInfo.userName;
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
        return virtualPlayerState.obstacle !== null && this.canFight(virtualPlayer, closestPlayerPosition);
    }

    private shouldOpenDoor(virtualPlayer: Player, virtualPlayerState: VirtualPlayerState) {
        return virtualPlayerState.obstacle !== null && virtualPlayer.playerInGame.remainingActions > 0;
    }

    private isBlocked(virtualPlayer: Player, virtualPlayerState: VirtualPlayerState) {
        return virtualPlayerState.obstacle !== null && virtualPlayer.playerInGame.remainingActions === 0;
    }

    private hasFlag(virtualPlayer: Player, room: RoomGame) {
        return room.game.mode === GameMode.CTF && virtualPlayer.playerInGame.inventory.includes(ItemType.Flag);
    }

    private doesExplodeWithFlag(virtualPlayer: Player, room: RoomGame) {
        return !this.hasFlag(virtualPlayer, room) || Math.random() < AI_BLOWUP_WITH_FLAG_PROB;
    }

    private moveToStartingPosition(virtualPlayer: Player, room: RoomGame) {
        const playerStartPosition = virtualPlayer.playerInGame.startPosition;
        this.virtualPlayerStateService.setIsSeekingPlayers(room.game, true);
        this.gameGateway.sendMove(room, playerStartPosition);
    }

    private isNextToOtherPlayer(closestPlayerPosition: Vec2, currentPlayerPosition: Vec2): boolean {
        const dx = Math.abs(closestPlayerPosition.x - currentPlayerPosition.x);
        const dy = Math.abs(closestPlayerPosition.y - currentPlayerPosition.y);

        return dx + dy === 1;
    }

    private hasBomb(virtualPlayer: Player) {
        return virtualPlayer.playerInGame.inventory.includes(ItemType.GeodeBomb);
    }

    private hasHammer(virtualPlayer: Player) {
        return virtualPlayer.playerInGame.inventory.includes(ItemType.GraniteHammer);
    }
}
