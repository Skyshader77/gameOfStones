import { Vec2 } from './vec2';
import { Map } from './map';

export interface GameStartInformation {
    map: Map;
    playerStarts: PlayerStartPosition[];
}

export interface PlayerStartPosition {
    userName: string;
    startPosition: Vec2;
}