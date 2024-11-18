import { inject, Injectable } from '@angular/core';
import { MAP_PIXEL_DIMENSION } from '@app/constants/rendering.constants';
import { SpriteService } from './sprite.service';
import { Avatar } from '@common/enums/avatar.enum';
import { FightState } from '@app/interfaces/fight-info';
import {
    ATTACK_FIGHT_FRAMES,
    HP_BAR_HEIGHT,
    HP_BAR_WIDTH,
    MY_FINAL_POSITION,
    MY_HP_BAR_POSITION_X,
    MY_HP_BAR_POSITION_Y,
    MY_STARTING_POSITION,
    MY_STARTING_POSITION_Y,
    OPPONENT_FINAL_POSITION,
    OPPONENT_HP_BAR_POSITION_X,
    OPPONENT_HP_BAR_POSITION_Y,
    OPPONENT_STARTING_POSITION,
    OPPONENT_STARTING_POSITION_Y,
    PIXEL_MOVEMENT,
    PLAYER_FIGHT_SPRITE_PIXEL,
} from '@app/constants/fight-rendering.constants';
import { Player } from '@common/interfaces/player';
import { RenderingStateService } from './rendering-state.service';

@Injectable({
    providedIn: 'root',
})
export class FightRenderingService {
    fightState: FightState = FightState.Idle;
    isCurrentFighter = false;
    private myPlayer: Player;
    private opponentPlayer: Player;
    private attackFrameCounter = 0;
    private isAttackingFoward = true;
    private ctx: CanvasRenderingContext2D;
    private blackOpacity = 1.0;
    private spriteService = inject(SpriteService);
    private rendererState = inject(RenderingStateService);
    private opponentStartingPosition = OPPONENT_STARTING_POSITION;
    private myStartingPosition = MY_STARTING_POSITION;

    setContext(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    setPlayers(myPlayer: Player, opponentPlayer: Player) {
        this.opponentPlayer = opponentPlayer;
        this.myPlayer = myPlayer;
    }

    renderFight() {
        this.renderIdleFight();
        this.renderUI();
        if (this.fightState === FightState.Start) {
            this.renderInitialFight();
        } else if (this.fightState === FightState.Attack) {
            this.renderAttackAnimation(this.isCurrentFighter);
        } else if (this.fightState === FightState.Evade) {
            this.renderEvade(this.isCurrentFighter);
        }
    }

    renderInitialFight() {
        this.fightState = FightState.Start;
        this.opponentStartingPosition.x += PIXEL_MOVEMENT;
        this.myStartingPosition.x -= PIXEL_MOVEMENT;

        if (this.opponentStartingPosition.x >= MY_STARTING_POSITION_Y || this.myStartingPosition.x <= OPPONENT_STARTING_POSITION_Y) {
            this.fightState = FightState.Idle;
            this.resetPositions();
            this.blackOpacity = 0;
        }

        if (this.blackOpacity > 0) {
            this.ctx.fillStyle = `rgba(0, 0, 0, ${this.blackOpacity})`;
            this.ctx.fillRect(0, 0, MAP_PIXEL_DIMENSION, MAP_PIXEL_DIMENSION);
            this.blackOpacity -= 0.005;
        }
    }

    renderIdleFight() {
        const background = this.spriteService.getBackgroundSpriteSheet(1);
        if (background) {
            this.ctx.drawImage(background, 0, 0, MAP_PIXEL_DIMENSION, MAP_PIXEL_DIMENSION);
        }
        this.renderPlayerFight(this.myPlayer.playerInfo.avatar, this.myStartingPosition, true);
        this.renderPlayerFight(this.opponentPlayer.playerInfo.avatar, this.opponentStartingPosition, true);
    }

    renderPlayerFight(playerType: Avatar, position: { x: number; y: number }, flip: boolean = false) {
        if (this.spriteService.isLoaded()) {
            const playerImage = this.spriteService.getPlayerFightSpriteSheet(playerType);
            if (playerImage) {
                this.ctx.save();

                if (flip) {
                    this.ctx.scale(-1, 1);
                    this.ctx.drawImage(
                        playerImage,
                        -position.x - PLAYER_FIGHT_SPRITE_PIXEL,
                        position.y,
                        PLAYER_FIGHT_SPRITE_PIXEL,
                        PLAYER_FIGHT_SPRITE_PIXEL,
                    );
                } else {
                    this.ctx.drawImage(playerImage, position.x, position.y, PLAYER_FIGHT_SPRITE_PIXEL, PLAYER_FIGHT_SPRITE_PIXEL);
                }

                this.ctx.restore();
            }
        }
    }

    renderAttackAnimation(isMyPlayer: boolean) {
        if (isMyPlayer) {
            if (this.isAttackingFoward) {
                this.myStartingPosition.x += PIXEL_MOVEMENT * 2;
                this.myStartingPosition.y -= PIXEL_MOVEMENT * 2;
                this.attackFrameCounter++;
            } else {
                this.myStartingPosition.x -= PIXEL_MOVEMENT * 2;
                this.myStartingPosition.y += PIXEL_MOVEMENT * 2;
                this.attackFrameCounter--;
            }
        } else {
            if (this.isAttackingFoward) {
                this.opponentStartingPosition.x -= PIXEL_MOVEMENT * 2;
                this.opponentStartingPosition.y += PIXEL_MOVEMENT * 2;
                this.attackFrameCounter++;
            } else {
                this.opponentStartingPosition.x += PIXEL_MOVEMENT * 2;
                this.opponentStartingPosition.y -= PIXEL_MOVEMENT * 2;
                this.attackFrameCounter--;
            }
        }

        if (this.attackFrameCounter >= ATTACK_FIGHT_FRAMES) {
            this.isAttackingFoward = !this.isAttackingFoward;
        }

        if (this.attackFrameCounter === 0) {
            this.isAttackingFoward = !this.isAttackingFoward;
            this.isCurrentFighter = !this.isCurrentFighter;
            this.fightState = FightState.Idle;
            this.resetPositions();
        }
    }

    resetPositions() {
        this.myStartingPosition = MY_FINAL_POSITION;
        this.opponentStartingPosition = OPPONENT_FINAL_POSITION;
    }

    renderUI() {
        if (this.fightState !== FightState.Start) {
            this.renderHP();
        }
    }

    renderHP() {
        if (this.fightState !== FightState.Start) {
            const myHPWidth = (this.myPlayer.playerInGame.remainingHp / this.myPlayer.playerInGame.attributes.hp) * HP_BAR_WIDTH;
            const opponentHPWidth = (this.opponentPlayer.playerInGame.remainingHp / this.opponentPlayer.playerInGame.remainingHp) * HP_BAR_WIDTH;

            this.ctx.fillStyle = 'green';
            this.ctx.fillRect(MY_HP_BAR_POSITION_X, MY_HP_BAR_POSITION_Y, myHPWidth, HP_BAR_HEIGHT);
            this.ctx.fillRect(OPPONENT_HP_BAR_POSITION_X, OPPONENT_HP_BAR_POSITION_Y, opponentHPWidth, HP_BAR_HEIGHT);

            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 6;
            this.ctx.strokeRect(MY_HP_BAR_POSITION_X, MY_HP_BAR_POSITION_Y, HP_BAR_WIDTH, HP_BAR_HEIGHT);
            this.ctx.strokeRect(OPPONENT_HP_BAR_POSITION_X, OPPONENT_HP_BAR_POSITION_Y, HP_BAR_WIDTH, HP_BAR_HEIGHT);
        }
    }

    renderEvade(isMyPlayer: boolean) {
        if (isMyPlayer) {
            this.myStartingPosition.x -= PIXEL_MOVEMENT;
        } else {
            this.opponentStartingPosition.x += PIXEL_MOVEMENT;
        }
        this.ctx.fillStyle = `rgba(0, 0, 0, ${this.blackOpacity})`;
        this.ctx.fillRect(0, 0, MAP_PIXEL_DIMENSION, MAP_PIXEL_DIMENSION);
        this.blackOpacity += 0.01;

        if (this.blackOpacity >= 1) {
            this.rendererState.fightStarted = false;
        }
    }
}
