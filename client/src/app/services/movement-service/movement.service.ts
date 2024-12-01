import { inject, Injectable } from '@angular/core';
import { SPRITE_DIRECTION_INDEX } from '@app/constants/player.constants';
import { MOVEMENT_FRAMES } from '@app/constants/rendering.constants';
import { Player } from '@app/interfaces/player';
import { PlayerMove } from '@app/interfaces/player-move';
import { ItemManagerService } from '@app/services/item-services/item-manager.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { directionToVec2Map, MovementServiceOutput, PathNode } from '@common/interfaces/move';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Vec2 } from '@common/interfaces/vec2';
import { Subscription } from 'rxjs';
import { GameMapService } from '@app/services/states/game-map/game-map.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket/game-logic-socket.service';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';

@Injectable({
    providedIn: 'root',
})
export class MovementService {
    private playerMovementsQueue: PlayerMove[] = [];

    private frame: number = 1;

    private movementSubscription: Subscription;
    private hammerSubscription: Subscription;
    private rendererStateService = inject(RenderingStateService);

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

        this.hammerSubscription = this.gameLogicSocketService.listenToHammerUsed().subscribe((hammerPayload) => {
            this.rendererStateService.findHammerTiles(hammerPayload.affectedTiles);
            this.rendererStateService.hammerTiles.map((playerMove) => {
                this.rendererStateService.isHammerMovement = true;
                const playerUsed = this.playerListService.getPlayerByName(hammerPayload.playerUsedName);
                if (!playerUsed) {
                    return;
                }
                this.addNewPlayerMove(playerUsed, playerMove);
                this.rendererStateService.hammerDeaths = hammerPayload.deadPlayers;
            });
        });
    }

    update() {
        if (this.playerMovementsQueue.length > 0) {
            this.movePlayer(this.playerMovementsQueue[0], this.rendererStateService.isHammerMovement);
        }
    }

    movePlayer(playerMove: PlayerMove, isHammerMovement: boolean = false) {
        const speed = directionToVec2Map[playerMove.node.direction];
        const player = playerMove.player;
        if (this.frame % MOVEMENT_FRAMES !== 0) {
            this.executeSmallPlayerMovement(player, speed);
            if (!isHammerMovement) {
                player.renderInfo.currentSprite = SPRITE_DIRECTION_INDEX[playerMove.node.direction];
            }
            this.frame++;
        } else {
            this.executeBigPlayerMovement(player, speed, playerMove.node.remainingMovement);
            this.playerMovementsQueue.shift();
            if (isHammerMovement && this.playerMovementsQueue.length === 0) {
                this.rendererStateService.isHammerMovement = false;
                this.rendererStateService.hammerTiles = [];
                this.playerListService.handleDeadPlayers(this.rendererStateService.hammerDeaths);
                this.rendererStateService.hammerDeaths = [];
            }
            if (this.shouldEndActionAfterMove()) {
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
        this.hammerSubscription.unsubscribe();
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

    private shouldEndActionAfterMove(): boolean {
        return (
            !this.isMoving() &&
            (this.myPlayerService.isCurrentPlayer || this.playerListService.isCurrentPlayerAI()) &&
            !this.itemManagerService.hasToDropItem
        );
    }
}
