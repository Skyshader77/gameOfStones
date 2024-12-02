import { ICE_COMBAT_DEBUFF_VALUE } from '@app/constants/gameplay.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { ActionService } from '@app/services/action/action.service';
import { ConditionalItemService } from '@app/services/item/conditional-item/conditional-item.service';
import { SimpleItemService } from '@app/services/item/simple-item/simple-item.service';
import { SpecialItemService } from '@app/services/item/special-item/special-item.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Gateway } from '@common/enums/gateway.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { TurnInformation } from '@common/interfaces/game-gateway-outputs';
import { Map } from '@common/interfaces/map';
import { ItemAction } from '@common/interfaces/overworld-action';
import { Player, PlayerAttributes } from '@common/interfaces/player';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class TurnInfoService {
    @Inject() private playerMovementService: PlayerMovementService;
    @Inject() private socketManagerService: SocketManagerService;
    @Inject() private roomManagerService: RoomManagerService;
    @Inject() private actionService: ActionService;
    @Inject() private simpleItemService: SimpleItemService;
    @Inject() private conditionalItemService: ConditionalItemService;
    @Inject() private specialItemService: SpecialItemService;

    sendTurnInformation(room: RoomGame) {
        const currentPlayerSocket = this.socketManagerService.getPlayerSocket(room.room.roomCode, room.game.currentPlayer, Gateway.Game);
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode) as Player;
        if (currentPlayerSocket && !currentPlayer.playerInGame.hasAbandoned) {
            const reachableTiles = this.playerMovementService.getReachableTiles(room);
            const actions = this.actionService.getOverWorldActions(currentPlayer, room);
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

    private getItemActions(currentPlayer: Player, room: RoomGame): ItemAction[] {
        const actions: ItemAction[] = [];
        currentPlayer.playerInGame.inventory.forEach((item) => {
            if (item === ItemType.GeodeBomb) {
                actions.push(this.specialItemService.determineBombAffectedTiles(currentPlayer.playerInGame.currentPosition, room.game.map));
            } else if (item === ItemType.GraniteHammer) {
                actions.push(...this.specialItemService.handleHammerActionTiles(currentPlayer, room));
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
