import { inject, Injectable } from '@angular/core';
import { MAP_PIXEL_DIMENSION } from '@app/constants/rendering.constants';
import { SpriteService } from './sprite.service';
import { Avatar } from '@common/enums/avatar.enum';

@Injectable({
    providedIn: 'root',
})
export class FightRenderingService {
    isInitialFight = false;
    private ctx: CanvasRenderingContext2D;
    private blackOpacity = 1.0;
    private spriteService = inject(SpriteService);
    private myStartingPosition = { x: 0 - 500, y: 100 };
    private opponentStartingPosition = { x: 1000 + 500, y: 900 };

    setContext(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    renderFight() {
        if (this.isInitialFight) {
            this.renderInitialFight();
        }
    }

    renderInitialFight() {
        this.isInitialFight = true;
        const background = this.spriteService.getBackgroundSpriteSheet(1);
        if (background) {
            this.ctx.drawImage(background, 0, 0, MAP_PIXEL_DIMENSION, MAP_PIXEL_DIMENSION);
        }
        this.renderPlayerFight(Avatar.MaleNinja, this.myStartingPosition, true);
        this.renderPlayerFight(Avatar.MaleWarrior, this.opponentStartingPosition);
        this.myStartingPosition.x += 6;
        this.opponentStartingPosition.x -= 6;

        if (this.myStartingPosition.x >= 900 || this.opponentStartingPosition.x <= 100) {
            this.isInitialFight = false;
            this.blackOpacity = 0;
        }

        if (this.blackOpacity > 0) {
            this.ctx.fillStyle = `rgba(0, 0, 0, ${this.blackOpacity})`;
            this.ctx.fillRect(0, 0, MAP_PIXEL_DIMENSION, MAP_PIXEL_DIMENSION);
            this.blackOpacity -= 0.005;
        }
    }

    renderPlayerFight(playerType: Avatar, position: { x: number; y: number }, flip: boolean = false) {
        if (this.spriteService.isLoaded()) {
            const playerImage = this.spriteService.getPlayerFightSpriteSheet(playerType);
            if (playerImage) {
                this.ctx.save();

                if (flip) {
                    this.ctx.scale(-1, 1);
                    this.ctx.drawImage(playerImage, -position.x - 500, position.y, 500, 500);
                } else {
                    this.ctx.drawImage(playerImage, position.x, position.y, 500, 500);
                }

                this.ctx.restore();
            }
        }
    }
}
