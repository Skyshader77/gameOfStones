import { Player as CommonPlayer } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';

export interface Player extends CommonPlayer {
    renderInfo: PlayerRenderInfo;
}

export interface PlayerRenderInfo {
    currentSprite: number;
    offset: Vec2;
}
