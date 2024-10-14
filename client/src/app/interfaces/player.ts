import { Vec2 } from './vec2';

export enum Avatar {
    NINJA,
}

export enum PlayerSprite {
    NINJA_UP = 'ninja_u',
    NINJA_DOWN = 'ninja_d',
    NINJA_LEFT = 'ninja_l',
    NINJA_RIGHT = 'ninja_r',
}

export interface Player {
    _id: string;
    name: string;
    avatar: Avatar;
    position: Vec2;
    offset: Vec2;
    playerSpeed: number;
    isPlayerTurn: Boolean;
    isInCombat: Boolean;
    playerSprite: PlayerSprite;
}
