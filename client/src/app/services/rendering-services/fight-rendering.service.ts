import { inject, Injectable } from '@angular/core';
import {
    ATTACK_FIGHT_FRAMES,
    BLACK,
    BLACK_OPACITY_DECREMENT,
    BLACK_OPACITY_INCREMENT,
    END_BLACK_OPACITY,
    FLIP_VECTOR,
    GREEN,
    HP_BAR_HEIGHT,
    HP_BAR_WIDTH,
    LINE_WIDTH,
    MY_FINAL_POSITION,
    MY_HP_BAR_POSITION_X,
    MY_HP_BAR_POSITION_Y,
    MY_STARTING_POSITION_X,
    MY_STARTING_POSITION_Y,
    OPPONENT_FINAL_POSITION,
    OPPONENT_HP_BAR_POSITION_X,
    OPPONENT_HP_BAR_POSITION_Y,
    OPPONENT_STARTING_POSITION_X,
    OPPONENT_STARTING_POSITION_Y,
    PIXEL_MOVEMENT,
    PLAYER_FIGHT_SPRITE_PIXEL,
    START_BLACK_OPACITY,
} from '@app/constants/fight-rendering.constants';
import { MAP_PIXEL_DIMENSION } from '@app/constants/rendering.constants';
import { FightState } from '@app/interfaces/fight-info';
import { FightSocketService } from '@app/services/communication-services/fight-socket.service';
import { FightStateService } from '@app/services/room-services/fight-state.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { Avatar } from '@common/enums/avatar.enum';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { RenderingStateService } from './rendering-state.service';
import { SpriteService } from './sprite.service';

@Injectable({
    providedIn: 'root',
})
export class FightRenderingService {
    private myPlayer: Player;
    private opponentPlayer: Player;
    private attackFrameCounter = 0;
    private isAttackingFoward = true;
    private ctx: CanvasRenderingContext2D;
    private blackOpacity = START_BLACK_OPACITY;
    private spriteService = inject(SpriteService);
    private rendererState = inject(RenderingStateService);
    private myPlayerService = inject(MyPlayerService);
    private fightStateService = inject(FightStateService);
    private fightSocketService = inject(FightSocketService);
    private opponentStartingPosition: Vec2;
    private myStartingPosition: Vec2;

    setPlayers() {
        this.myPlayer = this.myPlayerService.myPlayer;
        const opponent = this.fightStateService.currentFight.fighters.find(
            (player) => player.playerInfo.userName !== this.myPlayer.playerInfo.userName,
        );
        if (opponent) {
            this.opponentPlayer = opponent;
        }
        this.blackOpacity = START_BLACK_OPACITY;
        this.myStartingPosition = { x: MY_STARTING_POSITION_X + PLAYER_FIGHT_SPRITE_PIXEL, y: MY_STARTING_POSITION_Y };
        this.opponentStartingPosition = { x: OPPONENT_STARTING_POSITION_X - PLAYER_FIGHT_SPRITE_PIXEL, y: OPPONENT_STARTING_POSITION_Y };
    }

    setContext(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    renderFight() {
        this.renderIdleFight();
        this.renderUI();
        if (this.fightStateService.fightState === FightState.Start) {
            this.renderInitialFight();
        } else if (this.fightStateService.fightState === FightState.Attack) {
            this.renderAttackAnimation();
        } else if (this.fightStateService.fightState === FightState.Evade) {
            this.renderEvade();
        }
    }

    renderInitialFight() {
        this.opponentStartingPosition.x += PIXEL_MOVEMENT;
        this.myStartingPosition.x -= PIXEL_MOVEMENT;

        if (this.opponentStartingPosition.x >= MY_STARTING_POSITION_Y || this.myStartingPosition.x <= OPPONENT_STARTING_POSITION_Y) {
            this.fightStateService.fightState = FightState.Idle;
            this.resetPositions();
            if (this.myPlayerService.isCurrentFighter || this.fightStateService.isAIInFight()) {
                this.fightSocketService.sendDesiredFightTimer();
            }
            this.blackOpacity = END_BLACK_OPACITY;
        }

        if (this.blackOpacity > END_BLACK_OPACITY) {
            this.ctx.fillStyle = `rgba(0, 0, 0, ${this.blackOpacity})`;
            this.ctx.fillRect(0, 0, MAP_PIXEL_DIMENSION, MAP_PIXEL_DIMENSION);
            this.blackOpacity -= BLACK_OPACITY_DECREMENT;
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
            if (!playerImage) {
                return;
            }
            this.ctx.save();
            this.renderFighter(flip, playerImage, position);
            this.ctx.restore();
        }
    }

    renderAttackAnimation() {
        if (this.myPlayerService.isCurrentFighter) {
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
            this.fightStateService.fightState = FightState.Idle;
            this.resetPositions();
            if (this.myPlayerService.isCurrentFighter || this.fightStateService.isAIInFight()) {
                this.fightSocketService.endFightAction();
            }
        }
    }

    resetPositions() {
        this.myStartingPosition = { x: MY_FINAL_POSITION.x, y: MY_FINAL_POSITION.y };
        this.opponentStartingPosition = { x: OPPONENT_FINAL_POSITION.x, y: OPPONENT_FINAL_POSITION.y };
    }

    renderUI() {
        if (this.fightStateService.fightState !== FightState.Start) {
            this.renderHP();
        }
    }

    renderHP() {
        const myHPWidth = (this.myPlayer.playerInGame.remainingHp / this.myPlayer.playerInGame.attributes.hp) * HP_BAR_WIDTH;
        const opponentHPWidth = (this.opponentPlayer.playerInGame.remainingHp / this.opponentPlayer.playerInGame.attributes.hp) * HP_BAR_WIDTH;

        this.ctx.fillStyle = GREEN;
        this.ctx.fillRect(MY_HP_BAR_POSITION_X, MY_HP_BAR_POSITION_Y, myHPWidth, HP_BAR_HEIGHT);
        this.ctx.fillRect(OPPONENT_HP_BAR_POSITION_X, OPPONENT_HP_BAR_POSITION_Y, opponentHPWidth, HP_BAR_HEIGHT);

        this.ctx.strokeStyle = BLACK;
        this.ctx.lineWidth = LINE_WIDTH;
        this.ctx.strokeRect(MY_HP_BAR_POSITION_X, MY_HP_BAR_POSITION_Y, HP_BAR_WIDTH, HP_BAR_HEIGHT);
        this.ctx.strokeRect(OPPONENT_HP_BAR_POSITION_X, OPPONENT_HP_BAR_POSITION_Y, HP_BAR_WIDTH, HP_BAR_HEIGHT);
    }

    renderEvade() {
        if (this.myPlayerService.isCurrentFighter || this.fightStateService.isAIInFight()) {
            this.myStartingPosition.x -= PIXEL_MOVEMENT;
        } else {
            this.opponentStartingPosition.x += PIXEL_MOVEMENT;
        }
        this.ctx.fillStyle = `rgba(0, 0, 0, ${this.blackOpacity})`;
        this.ctx.fillRect(0, 0, MAP_PIXEL_DIMENSION, MAP_PIXEL_DIMENSION);
        this.blackOpacity += BLACK_OPACITY_INCREMENT;

        if (this.blackOpacity >= 1) {
            this.fightStateService.fightState = FightState.Idle;
            this.rendererState.fightStarted = false;
            if (this.myPlayerService.isCurrentFighter || this.fightStateService.isAIInFight()) {
                this.fightSocketService.endFightAction();
            }
        }
    }

    private renderFighter(flip: boolean, playerImage: HTMLImageElement, position: Vec2) {
        if (flip) {
            this.ctx.scale(FLIP_VECTOR.x, FLIP_VECTOR.y);
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
    }
}
