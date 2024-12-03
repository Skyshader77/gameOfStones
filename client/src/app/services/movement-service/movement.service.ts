import { inject, Injectable } from '@angular/core';
import { SPRITE_DIRECTION_INDEX } from '@app/constants/player.constants';
import { DEATH_ANGLE, DEATH_FRAMES, HAMMER_SPEED_UP, MOVEMENT_FRAMES, SLIP_ROTATION_DEG, SLIP_TICK } from '@app/constants/rendering.constants';
import { Player } from '@app/interfaces/player';
import { PlayerMove } from '@app/interfaces/player-move';
import { ItemManagerService } from '@app/services/item-services/item-manager.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { directionToVec2Map, MovementServiceOutput, PathNode } from '@common/interfaces/move';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Vec2 } from '@common/interfaces/vec2';
import { Subscription } from 'rxjs';
import { GameMapService } from '@app/services/states/game-map/game-map.service';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket/game-logic-socket.service';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';
import { AudioService } from '@app/services/audio/audio.service';
import { Sfx } from '@app/interfaces/sfx';
import { HammerPayload } from '@common/interfaces/item';

@Injectable({
    providedIn: 'root',
})
export class MovementService {
    private pendingMove: boolean = false;
    private pendingSlip: boolean = false;
    private playerMovementsQueue: PlayerMove[] = [];
    private frame: number = 1;

    private movementSubscription: Subscription;
    private hammerSubscription: Subscription;
    private slipSubscription: Subscription;
    private rendererStateService = inject(RenderingStateService);

    constructor(
        private gameMapService: GameMapService,
        private playerListService: PlayerListService,
        private gameLogicSocketService: GameLogicSocketService,
        private itemManagerService: ItemManagerService,
        private audioService: AudioService,
    ) {}

    initialize() {
        this.movementSubscription = this.gameLogicSocketService.listenToPlayerMove().subscribe((movement: MovementServiceOutput) => {
            for (const node of movement.optimalPath.path) {
                const currentPlayer = this.playerListService.getCurrentPlayer();
                if (currentPlayer) {
                    this.addNewPlayerMove(currentPlayer, node);
                }
            }
            this.pendingMove = true;
        });

        this.initHammerEvent();

        this.slipSubscription = this.gameLogicSocketService.listenToPlayerSlip().subscribe((hasSlipped: boolean) => {
            this.pendingSlip = hasSlipped;
        });
    }

    update() {
        if (this.pendingMove) {
            if (this.playerMovementsQueue.length > 0) {
                this.movePlayer(this.playerMovementsQueue[0]);
            } else if (this.itemManagerService.isWaitingForPickup()) {
                this.itemManagerService.pickupItem();
            } else if (!this.itemManagerService.hasToDropItem && this.pendingSlip) {
                this.slipPlayer();
            } else if (!this.itemManagerService.hasToDropItem && !this.pendingSlip) {
                this.gameLogicSocketService.endAction();
                this.pendingMove = false;
            }
        } else if (this.rendererStateService.isHammerMovement && this.playerMovementsQueue.length > 0) {
            this.hammerPlayer(this.playerMovementsQueue[0]);
        } else if (this.rendererStateService.deadPlayers.length > 0) {
            this.deadPlayers();
        }
    }

    movePlayer(playerMove: PlayerMove) {
        const speed = directionToVec2Map[playerMove.node.direction];
        const player = playerMove.player;
        if (this.frame % MOVEMENT_FRAMES !== 0) {
            this.executeSmallPlayerMovement(player, speed);
            player.renderInfo.currentSprite = SPRITE_DIRECTION_INDEX[playerMove.node.direction];
            this.frame++;
        } else {
            this.executeBigPlayerMovement(player, speed, playerMove.node.remainingMovement);
            this.playerMovementsQueue.shift();
            this.frame = 1;
        }
    }

    hammerPlayer(playerMove: PlayerMove) {
        const speed = directionToVec2Map[playerMove.node.direction];
        const player = playerMove.player;
        if (this.frame % (MOVEMENT_FRAMES / HAMMER_SPEED_UP) !== 0) {
            this.executeSmallPlayerMovement(player, { x: speed.x * HAMMER_SPEED_UP, y: speed.y * HAMMER_SPEED_UP });
            this.frame++;
        } else {
            this.executeBigPlayerMovement(player, speed, player.playerInGame.remainingMovement);
            this.playerMovementsQueue.shift();
            this.frame = 1;
            if (this.playerMovementsQueue.length === 0) {
                this.rendererStateService.isHammerMovement = false;
            }
        }
    }

    deadPlayers() {
        this.rendererStateService.deadPlayers.forEach((dead) => {
            const player = this.playerListService.getPlayerByName(dead.player.playerInfo.userName);
            if (player) {
                player.renderInfo.angle = DEATH_ANGLE;
            }
        });
        this.frame++;
        if (this.frame > DEATH_FRAMES) {
            this.rendererStateService.deadPlayers.forEach((dead) => {
                const player = this.playerListService.getPlayerByName(dead.player.playerInfo.userName);
                if (player) {
                    player.playerInGame.currentPosition = JSON.parse(JSON.stringify(dead.respawnPosition)) as Vec2;
                    player.renderInfo.angle = 0;
                }
            });
            this.frame = 1;
            this.rendererStateService.deadPlayers = [];
            this.gameLogicSocketService.endAction();
        }
    }

    slipPlayer() {
        const currentPlayer = this.playerListService.getCurrentPlayer();
        if (currentPlayer) {
            if (currentPlayer.renderInfo.angle === 0) {
                this.audioService.playSfx(Sfx.PlayerSlip);
            }
            currentPlayer.renderInfo.angle += SLIP_TICK;
            if (currentPlayer.renderInfo.angle === SLIP_ROTATION_DEG) {
                this.pendingSlip = false;
                currentPlayer.renderInfo.angle = 0;
            }
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
        this.slipSubscription.unsubscribe();
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

    private initHammerEvent() {
        this.hammerSubscription = this.gameLogicSocketService.listenToHammerUsed().subscribe((hammerPayload: HammerPayload) => {
            this.audioService.playSfx(Sfx.Hammer);
            this.rendererStateService.findHammerTiles(hammerPayload.movementTiles);
            this.rendererStateService.hammerTiles.map((playerMove) => {
                const hammered = this.playerListService.getPlayerByName(hammerPayload.hammeredName);
                if (!hammered) {
                    return;
                }
                this.addNewPlayerMove(hammered, playerMove);
            });

            this.rendererStateService.isHammerMovement = true;
            this.rendererStateService.hammerTiles = [];
        });
    }
}
