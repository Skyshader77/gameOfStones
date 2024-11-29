import { ICE_COMBAT_DEBUFF_VALUE } from '@app/constants/gameplay.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { ConditionalItemService } from '@app/services/conditional-item/conditional-item.service';
import { PlayerMovementService } from '@app/services/player-movement/player-movement.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SimpleItemService } from '@app/services/simple-item/simple-item.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { Gateway } from '@common/enums/gateway.enum';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { TurnInformation } from '@common/interfaces/game-gateway-outputs';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { Map } from '@common/interfaces/map';
import { Player, PlayerAttributes } from '@common/interfaces/player';
import { Inject, Injectable } from '@nestjs/common';
import { ActionService } from '@app/services/action/action.service';

@Injectable()
export class TurnInfoService {
    @Inject() private playerMovementService: PlayerMovementService;
    @Inject() private socketManagerService: SocketManagerService;
    @Inject() private roomManagerService: RoomManagerService;
    @Inject() private actionService: ActionService;
    @Inject() private simpleItemService: SimpleItemService;
    @Inject() private conditionalItemService: ConditionalItemService;

    sendTurnInformation(room: RoomGame) {
        const currentPlayerSocket = this.socketManagerService.getPlayerSocket(room.room.roomCode, room.game.currentPlayer, Gateway.Game);
        const currentPlayer = this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode) as Player;
        if (currentPlayerSocket && !currentPlayer.playerInGame.hasAbandoned) {
            const reachableTiles = this.playerMovementService.getReachableTiles(room, currentPlayer, false);
            const actions = this.actionService.getOverWorldActions(currentPlayer, room);
            this.updateCurrentPlayerAttributes(currentPlayer, room.game.map);
            const turnInfo: TurnInformation = {
                attributes: currentPlayer.playerInGame.attributes,
                reachableTiles,
                actions,
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

    private applyIceDebuff(currentPlayer: Player, map: Map) {
        if (map.mapArray[currentPlayer.playerInGame.currentPosition.y][currentPlayer.playerInGame.currentPosition.x] === TileTerrain.Ice) {
            currentPlayer.playerInGame.attributes.attack += ICE_COMBAT_DEBUFF_VALUE.attack;
            currentPlayer.playerInGame.attributes.defense += ICE_COMBAT_DEBUFF_VALUE.defense;
        }
    }
}
