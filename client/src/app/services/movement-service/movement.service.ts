import { Injectable } from '@angular/core';
import { DIRECTION_TO_MOVEMENT, SPRITE_DIRECTION_INDEX } from '@app/constants/player.constants';
import { MOVEMENT_FRAMES } from '@app/constants/rendering.constants';
import { Player } from '@app/interfaces/player';
import { PlayerMove } from '@app/interfaces/player-move';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { ItemManagerService } from '@app/services/item-services/item-manager.service';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { MovementServiceOutput, PathNode } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class MovementService {
    private playerMovementsQueue: PlayerMove[] = [];

    private frame: number = 1;

    private movementSubscription: Subscription;

    constructor(
        private gameMapService: GameMapService,
        private playerListService: PlayerListService,
        private myPlayerService: MyPlayerService,
        private gameLogicSocketService: GameLogicSocketService,
        private itemManagerService: ItemManagerService,
    ) {}

    initialize() {
        this.movementSubscription = this.gameLogicSocketService.listenToPlayerMove().subscribe((movement: MovementServiceOutput) => {
            for (const node of movement.optimalPath.path) {
                const currentPlayer = this.playerListService.getCurrentPlayer();
                if (currentPlayer) {
                    this.addNewPlayerMove(currentPlayer, node);
                }
            }
        });
    }

    update() {
        if (this.playerMovementsQueue.length > 0) {
            this.movePlayer(this.playerMovementsQueue[0]);
        }
    }

    movePlayer(playerMove: PlayerMove) {
        const speed = DIRECTION_TO_MOVEMENT[playerMove.node.direction];
        const player = playerMove.player;
        if (this.frame % MOVEMENT_FRAMES !== 0) {
            this.executeSmallPlayerMovement(player, speed);
            player.renderInfo.currentSprite = SPRITE_DIRECTION_INDEX[playerMove.node.direction];
            this.frame++;
        } else {
            this.executeBigPlayerMovement(player, speed, playerMove.node.remainingMovement);
            this.playerMovementsQueue.shift();
            if (!this.isMoving() && this.myPlayerService.isCurrentPlayer && !this.itemManagerService.gethasToDropItem) {
                this.gameLogicSocketService.endAction();
            }
            this.frame = 1;
        }
    }

    addNewPlayerMove(player: Player, node: PathNode) {
        this.playerMovementsQueue.push({
            player,
            node,
        });
    }

    isMoving(): boolean {
        return this.playerMovementsQueue.length > 0;
    }

    cleanup() {
        this.movementSubscription.unsubscribe();
    }

    private executeSmallPlayerMovement(player: Player, speed: Vec2) {
        player.renderInfo.offset.x += (speed.x * this.gameMapService.getTileDimension()) / (MOVEMENT_FRAMES - 1);
        player.renderInfo.offset.y += (speed.y * this.gameMapService.getTileDimension()) / (MOVEMENT_FRAMES - 1);
    }

    private executeBigPlayerMovement(player: Player, speed: Vec2, remainingMovement: number) {
        player.playerInGame.currentPosition.x += speed.x;
        player.playerInGame.currentPosition.y += speed.y;
        player.renderInfo.offset = { x: 0, y: 0 };
        player.playerInGame.remainingMovement = remainingMovement;
        const tile = this.gameMapService.map.mapArray[player.playerInGame.currentPosition.y][player.playerInGame.currentPosition.x];
        if (tile !== TileTerrain.Ice) {
            player.renderInfo.currentStep *= -1;
        }
    }
}
