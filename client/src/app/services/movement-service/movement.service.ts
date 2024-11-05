import { Injectable } from '@angular/core';
import { DIRECTION_TO_MOVEMENT, SPRITE_DIRECTION_INDEX } from '@app/constants/player.constants';
import { IDLE_FRAMES, MOVEMENT_FRAMES } from '@app/constants/rendering.constants';
import { Player } from '@app/interfaces/player';
import { PlayerMove } from '@app/interfaces/player-move';
import { GameMapService } from '@app/services/room-services/game-map.service';
import { Direction, MovementServiceOutput } from '@common/interfaces/move';
import { Vec2 } from '@common/interfaces/vec2';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { Subscription } from 'rxjs';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket.service';
import { TILE_COSTS } from '@common/enums/tile-terrain.enum';

@Injectable({
    providedIn: 'root',
})
export class MovementService {
    private playerMovementsQueue: PlayerMove[] = [];

    private frame: number = 1;
    private timeout: number = 1;

    private movementSubscription: Subscription;

    constructor(
        private gameMapService: GameMapService,
        private playerListService: PlayerListService,
        private gameLogicSocketService: GameLogicSocketService,
    ) {}

    initialize() {
        this.movementSubscription = this.gameLogicSocketService.listenToPlayerMove().subscribe((movement: MovementServiceOutput) => {
            for (const direction of movement.optimalPath.path) {
                const currentPlayer = this.playerListService.getCurrentPlayer();
                if (currentPlayer) {
                    this.addNewPlayerMove(currentPlayer, direction);
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
        const speed = DIRECTION_TO_MOVEMENT[playerMove.direction];
        const player = playerMove.player;
        if (this.frame % MOVEMENT_FRAMES !== 0) {
            this.executeSmallPlayerMovement(player, speed);
            player.renderInfo.currentSprite = SPRITE_DIRECTION_INDEX[playerMove.direction];
            this.frame++;
        } else {
            if (this.timeout % IDLE_FRAMES === 0) {
                this.executeBigPlayerMovement(player, speed);
                this.playerMovementsQueue.shift();
                if (!this.isMoving()) {
                    this.gameLogicSocketService.endAction();
                }
                this.timeout = 1;
                this.frame = 1;
            } else {
                this.timeout++;
            }
        }
    }

    addNewPlayerMove(player: Player, direction: Direction) {
        this.playerMovementsQueue.push({
            player,
            direction,
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

    private executeBigPlayerMovement(player: Player, speed: Vec2) {
        player.playerInGame.currentPosition.x += speed.x;
        player.playerInGame.currentPosition.y += speed.y;
        player.renderInfo.offset = { x: 0, y: 0 };
        const tile = this.gameMapService.map.mapArray[player.playerInGame.currentPosition.y][player.playerInGame.currentPosition.x];
        player.playerInGame.remainingMovement -= TILE_COSTS[tile];
    }
}
