import { RoomGame } from '@app/interfaces/room-game';
import { Inject, Injectable } from '@nestjs/common';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SimpleItemService } from '@app/services/simple-item/simple-item.service';
import { ConditionalItemService } from '@app/services/conditional-item/conditional-item.service';
import { Player, PlayerAttributes } from '@common/interfaces/player';
import { Gateway } from '@common/enums/gateway.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { TurnInformation } from '@common/interfaces/game-gateway-outputs';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { Map } from '@common/interfaces/map';
import { ICE_COMBAT_DEBUFF_VALUE } from '@app/constants/gameplay.constants';
import { OverWorldAction } from '@common/interfaces/overworld-action';
import { Vec2 } from '@common/interfaces/vec2';
import { Direction, directionToVec2Map } from '@common/interfaces/move';
import { isAnotherPlayerPresentOnTile, isCoordinateWithinBoundaries } from '@app/utils/utilities';
import { OverWorldActionType } from '@common/enums/overworld-action-type.enum';
import { ItemType } from '@common/enums/item-type.enum';

@Injectable()
export class TurnInfoService {
    @Inject() private playerMovementService: PlayerMovementService;
    @Inject() private socketManagerService: SocketManagerService;
    @Inject() private roomManagerService: RoomManagerService;
    @Inject() private simpleItemService: SimpleItemService;
    @Inject() private conditionalItemService: ConditionalItemService;

    sendTurnInformation(room: RoomGame) {
        const currentPlayerSocket = this.socketManagerService.getPlayerSocket(room.room.roomCode, room.game.currentPlayer, Gateway.Game);
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode) as Player;
        if (currentPlayerSocket && !currentPlayer.playerInGame.hasAbandoned) {
            const reachableTiles = this.playerMovementService.getReachableTiles(room);
            const actions = this.getOverWorldActions(currentPlayer, room);
            this.updateCurrentPlayerAttributes(currentPlayer, room.game.map);
            const turnInfo: TurnInformation = {
                attributes: currentPlayer.playerInGame.attributes,
                reachableTiles,
                actions,
            };
            currentPlayerSocket.emit(GameEvents.TurnInfo, turnInfo);
        }
    }

    private getOverWorldActions(currentPlayer: Player, room: RoomGame): OverWorldAction[] {
        const actions: OverWorldAction[] = [];

        const fightAndDoorActions = this.getFightAndDoorActions(currentPlayer.playerInGame.currentPosition, room.game.map, room.players);
        const itemActions = this.getItemActions(currentPlayer);
        actions.push(...fightAndDoorActions);
        actions.push(...itemActions);
        return actions;
    }
    private getFightAndDoorActions(currentPlayerPosition: Vec2, map: Map, players: Player[]): OverWorldAction[] {
        const actions: OverWorldAction[] = [];
        for (const direction of Object.values(Direction)) {
            const directionVec = directionToVec2Map[direction];
            const newPosition = { x: currentPlayerPosition.x + directionVec.x, y: currentPlayerPosition.y + directionVec.y };
            if (isCoordinateWithinBoundaries(newPosition, map.mapArray)) {
                if (isAnotherPlayerPresentOnTile(newPosition, players)) {
                    actions.push({ action: OverWorldActionType.Fight, position: newPosition });
                } else if (
                    map.mapArray[newPosition.y][newPosition.x] === TileTerrain.OpenDoor ||
                    map.mapArray[newPosition.y][newPosition.x] === TileTerrain.ClosedDoor
                ) {
                    actions.push({ action: OverWorldActionType.Door, position: newPosition });
                }
            }
        }
        return actions;
    }

    private getItemActions(currentPlayer: Player): OverWorldAction[] {
        const actions: OverWorldAction[] = [];
        currentPlayer.playerInGame.inventory.forEach((item) => {
            if (item === ItemType.GeodeBomb || item === ItemType.GraniteHammer) {
                // TODO actually send the right item to use
                actions.push({ action: OverWorldActionType.SpecialItem, position: { x: -1, y: -1 } });
            }
        });

        return actions;
    }

    private updateCurrentPlayerAttributes(currentPlayer: Player, map: Map) {
        currentPlayer.playerInGame.attributes = JSON.parse(JSON.stringify(currentPlayer.playerInGame.baseAttributes)) as PlayerAttributes;
        this.simpleItemService.applySimpleItems(currentPlayer);
        this.conditionalItemService.applyQuartzSkates(currentPlayer, map);
        this.applyIceDebuff(currentPlayer, map);
    }

    private applyIceDebuff(currentPlayer: Player, map: Map) {
        if (map.mapArray[currentPlayer.playerInGame.currentPosition.y][currentPlayer.playerInGame.currentPosition.x] === TileTerrain.Ice) {
            currentPlayer.playerInGame.attributes.attack += ICE_COMBAT_DEBUFF_VALUE.attack;
            currentPlayer.playerInGame.attributes.defense += ICE_COMBAT_DEBUFF_VALUE.defense;
        }
    }
}
