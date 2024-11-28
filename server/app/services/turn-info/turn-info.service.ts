import { ICE_COMBAT_DEBUFF_VALUE } from '@app/constants/gameplay.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { ConditionalItemService } from '@app/services/conditional-item/conditional-item.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SimpleItemService } from '@app/services/simple-item/simple-item.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { SpecialItemService } from '@app/services/special-item/special-item.service';
import { getAdjacentPositions, isAnotherPlayerPresentOnTile, isCoordinateWithinBoundaries } from '@app/utils/utilities';
import { Gateway } from '@common/enums/gateway.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { OverWorldActionType } from '@common/enums/overworld-action-type.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { TurnInformation } from '@common/interfaces/game-gateway-outputs';
import { Map } from '@common/interfaces/map';
import { Direction, directionToVec2Map } from '@common/interfaces/move';
import { ItemAction, OverWorldAction } from '@common/interfaces/overworld-action';
import { Player, PlayerAttributes } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class TurnInfoService {
    @Inject() private playerMovementService: PlayerMovementService;
    @Inject() private socketManagerService: SocketManagerService;
    @Inject() private roomManagerService: RoomManagerService;
    @Inject() private simpleItemService: SimpleItemService;
    @Inject() private conditionalItemService: ConditionalItemService;
    @Inject() private specialItemService: SpecialItemService;

    sendTurnInformation(room: RoomGame) {
        const currentPlayerSocket = this.socketManagerService.getPlayerSocket(room.room.roomCode, room.game.currentPlayer, Gateway.Game);
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode) as Player;
        if (currentPlayerSocket && !currentPlayer.playerInGame.hasAbandoned) {
            const reachableTiles = this.playerMovementService.getReachableTiles(room, currentPlayer, false);
            const actions = this.getOverWorldActions(currentPlayer, room);
            const itemActions = this.getItemActions(currentPlayer, room);
            this.updateCurrentPlayerAttributes(currentPlayer, room.game.map);
            const turnInfo: TurnInformation = {
                attributes: currentPlayer.playerInGame.attributes,
                reachableTiles,
                actions,
                itemActions,
            };
            currentPlayerSocket.emit(GameEvents.TurnInfo, turnInfo);
        }
    }

    updateCurrentPlayerAttributes(currentPlayer: Player, map: Map) {
        currentPlayer.playerInGame.attributes = JSON.parse(JSON.stringify(currentPlayer.playerInGame.baseAttributes)) as PlayerAttributes;
        this.simpleItemService.applySimpleItems(currentPlayer);
        this.conditionalItemService.applyQuartzSkates(currentPlayer, map);
        this.applyIceDebuff(currentPlayer, map);
    }

    private getOverWorldActions(currentPlayer: Player, room: RoomGame): OverWorldAction[] {
        const actions: OverWorldAction[] = [];

        if (currentPlayer.playerInGame.remainingActions === 0) return actions;

        const fightAndDoorActions = this.getFightAndDoorActions(currentPlayer.playerInGame.currentPosition, room.game.map, room.players);
        actions.push(...fightAndDoorActions);

        return actions;
    }

    private getFightAndDoorActions(currentPlayerPosition: Vec2, map: Map, players: Player[]): OverWorldAction[] {
        const actions: OverWorldAction[] = [];
        for (const direction of Object.values(Direction)) {
            const directionVec = directionToVec2Map[direction];
            const newPosition = { x: currentPlayerPosition.x + directionVec.x, y: currentPlayerPosition.y + directionVec.y };
            if (isCoordinateWithinBoundaries(newPosition, map.mapArray)) {
                const newAction = this.getAction(newPosition, players, map);
                if (newAction) {
                    actions.push(newAction);
                }
            }
        }
        return actions;
    }

    private getAction(newPosition: Vec2, players: Player[], map: Map): OverWorldAction | null {
        let action: OverWorldAction = null;
        if (isAnotherPlayerPresentOnTile(newPosition, players)) {
            action = { action: OverWorldActionType.Fight, position: newPosition };
        } else if (
            map.mapArray[newPosition.y][newPosition.x] === TileTerrain.OpenDoor ||
            map.mapArray[newPosition.y][newPosition.x] === TileTerrain.ClosedDoor
        ) {
            action = { action: OverWorldActionType.Door, position: newPosition };
        }

        return action;
    }

    private getItemActions(currentPlayer: Player, room: RoomGame): ItemAction[] {
        const actions: ItemAction[] = [];
        currentPlayer.playerInGame.inventory.forEach((item) => {
            if (item === ItemType.GeodeBomb) {
                actions.push(this.specialItemService.determineBombAffectedTiles(currentPlayer.playerInGame.currentPosition, room.game.map));
            } else if (item === ItemType.GraniteHammer) {
                for (const tile of getAdjacentPositions(currentPlayer.playerInGame.currentPosition)) {
                    if (isAnotherPlayerPresentOnTile(tile, room.players)) {
                        actions.push(this.specialItemService.determineHammerAffectedTiles(currentPlayer, tile, room.game.map));
                    }
                }
            }
        });

        return actions;
    }

    private applyIceDebuff(currentPlayer: Player, map: Map) {
        if (map.mapArray[currentPlayer.playerInGame.currentPosition.y][currentPlayer.playerInGame.currentPosition.x] === TileTerrain.Ice) {
            currentPlayer.playerInGame.attributes.attack += ICE_COMBAT_DEBUFF_VALUE.attack;
            currentPlayer.playerInGame.attributes.defense += ICE_COMBAT_DEBUFF_VALUE.defense;
        }
    }
}
