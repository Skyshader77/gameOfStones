import { Injectable } from '@angular/core';
import { DIRECTION_TO_SPEED } from '@app/constants/conversion.constants';
import { SPRITE_DIRECTION_INDEX } from '@app/constants/player.constants';
import { IDLE_FRAMES, MOVEMENT_FRAMES } from '@app/constants/rendering.constants';
import { Player } from '@app/interfaces/player';
import { PlayerMove } from '@app/interfaces/player-move';
import { Direction } from '@app/interfaces/reachable-tiles';
import { Vec2 } from '@common/interfaces/vec2';
import { GameMapService } from '@app/services/room-services/game-map.service';

@Injectable({
    providedIn: 'root',
})
export class MovementService {
    playerMovementsQueue: PlayerMove[] = [];

    currentPlayerMove: PlayerMove | undefined = undefined;
    frame: number = 1;
    timeout: number = 1;

    constructor(private gameMapService: GameMapService) {}

    update() {
        this.currentPlayerMove = this.playerMovementsQueue[0];
        if (this.currentPlayerMove) {
            this.movePlayer(this.currentPlayerMove);
        }
    }

    movePlayer(playerMove: PlayerMove) {
        const speed = DIRECTION_TO_SPEED[playerMove.direction];
        const player = playerMove.player;
        if (this.frame % MOVEMENT_FRAMES !== 0) {
            this.executeSmallPlayerMovement(player, speed);
            player.playerInGame.renderInfo.currentSprite = SPRITE_DIRECTION_INDEX[playerMove.direction];
            this.frame++;
        } else {
            if (this.timeout % IDLE_FRAMES === 0) {
                this.executeBigPlayerMovement(player, speed);
                this.currentPlayerMove = this.playerMovementsQueue.shift();
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
        return this.currentPlayerMove !== null;
    }

    private executeSmallPlayerMovement(player: Player, speed: Vec2) {
        player.playerInGame.renderInfo.offset.x += (speed.x * this.gameMapService.getTileDimension()) / (MOVEMENT_FRAMES - 1);
        player.playerInGame.renderInfo.offset.y += (speed.y * this.gameMapService.getTileDimension()) / (MOVEMENT_FRAMES - 1);
    }

    private executeBigPlayerMovement(player: Player, speed: Vec2) {
        player.playerInGame.currentPosition.x += speed.x;
        player.playerInGame.currentPosition.y += speed.y;
        player.playerInGame.renderInfo.offset = { x: 0, y: 0 };
    }
}
