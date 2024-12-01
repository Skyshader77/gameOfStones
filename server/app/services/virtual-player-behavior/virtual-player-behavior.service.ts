import { FightGateway } from '@app/gateways/fight/fight.gateway';
import { GameGateway } from '@app/gateways/game/game.gateway';
import { ClosestObject, ClosestObjectData, DefensiveItemStrategyData, VirtualPlayerState, VirtualPlayerTurnData } from '@app/interfaces/ai-state';
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
        const { closestObjectData, room, virtualPlayer, virtualPlayerState } = turnData;

        this.virtualPlayerStateService.setIsSeekingPlayers(room.game, false);
        const closestOffensiveItem = this.pathFindingService.getNearestItemPosition(
            room,
            virtualPlayer.playerInGame.currentPosition,
            OFFENSIVE_ITEMS,
        );

        const actionStrategies = [
            this.createBombStrategy(virtualPlayer, room),
            this.createHammerStrategy(virtualPlayer, closestObjectData, room),
            this.createFightStrategy(virtualPlayer, closestObjectData, virtualPlayerState, room),
            this.createDoorStrategy(virtualPlayer, virtualPlayerState, room),
            this.createFlagStrategy(virtualPlayer, room),
            this.createMoveToPlayerStrategy(virtualPlayer, closestObjectData, virtualPlayerState, room),
            this.createOffensiveItemStrategy(virtualPlayer, closestOffensiveItem, room),
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
        const { closestObjectData, room, virtualPlayer, virtualPlayerState } = turnData;

        this.virtualPlayerStateService.setIsSeekingPlayers(room.game, false);
        const closestDefensiveItem = this.pathFindingService.getNearestItemPosition(
            room,
            virtualPlayer.playerInGame.currentPosition,
            DEFENSIVE_ITEMS,
        );

        const actionStrategies = [
            this.createBombStrategy(virtualPlayer, room),
            this.createHammerStrategy(virtualPlayer, closestObjectData, room),
            this.createForcedFightStrategy(virtualPlayer, closestObjectData, virtualPlayerState, room),
            this.createDoorStrategy(virtualPlayer, virtualPlayerState, room),
            this.createFlagStrategy(virtualPlayer, room),
            this.createDefensiveItemStrategy({ virtualPlayer, closestDefensiveItem, closestObjectData, virtualPlayerState }, room),
            this.createItemStrategy(virtualPlayer, closestObjectData, virtualPlayerState, room),
            this.createFightStrategy(virtualPlayer, closestObjectData, virtualPlayerState, room),
            this.createMoveToPlayerStrategy(virtualPlayer, closestObjectData, virtualPlayerState, room),
        ];

        for (const strategy of actionStrategies) {
            if (strategy()) {
                return;
            }
        }

        this.gameGateway.endPlayerTurn(room);
    }

    private createOffensiveItemStrategy(virtualPlayer: Player, closestOffensiveItem: ClosestObject, room: RoomGame) {
        return () => {
            if (closestOffensiveItem && this.isClosestOffensiveItemReachable(virtualPlayer, closestOffensiveItem)) {
                this.gameGateway.sendMove(room, closestOffensiveItem.position);
                return true;
            }
            return false;
        };
    }

    private createAlternateMoveToPlayerStrategy(virtualPlayer: Player, closestObjectData: ClosestObjectData, room: RoomGame) {
        return () => {
            if (!this.isNextToOtherPlayer(closestObjectData.closestPlayer.position, virtualPlayer.playerInGame.currentPosition)) {
                this.virtualPlayerStateService.setIsSeekingPlayers(room.game, true);
                this.gameGateway.sendMove(room, closestObjectData.closestPlayer.position);
                return true;
            }
            return false;
        };
    }

    private createBombStrategy(virtualPlayer: Player, room: RoomGame) {
        return () => {
            if (
                this.hasBomb(virtualPlayer) &&
                this.specialItemService.areAnyPlayersInBombRange(virtualPlayer.playerInGame.currentPosition, room.game.map, room)
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

    private createHammerStrategy(virtualPlayer: Player, closestObjectData: ClosestObjectData, room: RoomGame) {
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

    private createForcedFightStrategy(
        virtualPlayer: Player,
        closestObjectData: ClosestObjectData,
        virtualPlayerState: VirtualPlayerState,
        room: RoomGame,
    ) {
        return () => {
            if (this.hasToFight(virtualPlayer, closestObjectData.closestPlayer.position, virtualPlayerState)) {
                this.initiateFight(closestObjectData.closestPlayer.position, room, virtualPlayerState);
                return true;
            }
            return false;
        };
    }

    private createDoorStrategy(virtualPlayer: Player, virtualPlayerState: VirtualPlayerState, room: RoomGame) {
        return () => {
            if (this.shouldOpenDoor(virtualPlayer, virtualPlayerState)) {
                this.gameGateway.togglePlayerDoor(room, virtualPlayerState.obstacle);
                return true;
            }
            return false;
        };
    }

    private createFlagStrategy(virtualPlayer: Player, room: RoomGame) {
        return () => {
            if (this.hasFlag(virtualPlayer, room)) {
                this.moveToStartingPosition(virtualPlayer, room);
                return true;
            }
            return false;
        };
    }

    private createDefensiveItemStrategy(defensiveItemStrategyData: DefensiveItemStrategyData, room: RoomGame) {
        return () => {
            if (
                this.doesClosestItemExist(defensiveItemStrategyData.closestDefensiveItem) &&
                !this.hasJustEvadedAndBlocked(
                    defensiveItemStrategyData.closestObjectData,
                    defensiveItemStrategyData.virtualPlayer,
                    defensiveItemStrategyData.virtualPlayerState,
                ) &&
                !this.isBlocked(defensiveItemStrategyData.virtualPlayer, defensiveItemStrategyData.virtualPlayerState)
            ) {
                this.gameGateway.sendMove(room, defensiveItemStrategyData.closestDefensiveItem.position);
                return true;
            }
            return false;
        };
    }

    private createItemStrategy(virtualPlayer: Player, closestObjectData: ClosestObjectData, virtualPlayerState: VirtualPlayerState, room: RoomGame) {
        return () => {
            if (
                this.doesClosestItemExist(closestObjectData.closestItem) &&
                !this.hasJustEvadedAndBlocked(closestObjectData, virtualPlayer, virtualPlayerState) &&
                !this.isBlocked(virtualPlayer, virtualPlayerState)
            ) {
                this.gameGateway.sendMove(room, closestObjectData.closestItem.position);
                return true;
            }
            return false;
        };
    }

    private createFightStrategy(virtualPlayer: Player, closestObjectData: ClosestObjectData, virtualPlayerState: VirtualPlayerState, room: RoomGame) {
        return () => {
            if (this.canFight(virtualPlayer, closestObjectData.closestPlayer.position)) {
                this.initiateFight(closestObjectData.closestPlayer.position, room, virtualPlayerState);
                return true;
            }
            return false;
        };
    }

    private createMoveToPlayerStrategy(
        virtualPlayer: Player,
        closestObjectData: ClosestObjectData,
        virtualPlayerState: VirtualPlayerState,
        room: RoomGame,
    ) {
        return () => {
            if (
                !this.isNextToOtherPlayer(closestObjectData.closestPlayer.position, virtualPlayer.playerInGame.currentPosition) &&
                !this.isBlocked(virtualPlayer, virtualPlayerState)
            ) {
                this.virtualPlayerStateService.setIsSeekingPlayers(room.game, true);
                this.gameGateway.sendMove(room, closestObjectData.closestPlayer.position);
                return true;
            }
            return false;
        };
    }

    private hasJustEvadedAndBlocked(closestObjectData: ClosestObjectData, virtualPlayer: Player, virtualPlayerState: VirtualPlayerState) {
        return (
            this.isNextToOtherPlayer(closestObjectData.closestPlayer.position, virtualPlayer.playerInGame.currentPosition) &&
            virtualPlayerState.justExitedFight
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
        return virtualPlayerState.obstacle && this.canFight(virtualPlayer, closestPlayerPosition);
    }

    private shouldOpenDoor(virtualPlayer: Player, virtualPlayerState: VirtualPlayerState) {
        return virtualPlayerState.obstacle && virtualPlayer.playerInGame.remainingActions > 0;
    }

    private isBlocked(virtualPlayer: Player, virtualPlayerState: VirtualPlayerState) {
        return virtualPlayerState.obstacle && virtualPlayer.playerInGame.remainingActions === 0;
    }

    private hasFlag(virtualPlayer: Player, room: RoomGame) {
        return room.game.mode === GameMode.CTF && virtualPlayer.playerInGame.inventory.includes(ItemType.Flag);
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
