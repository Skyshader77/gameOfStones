import { Player } from './player';
import { Direction } from './reachable-tiles';

export interface PlayerMove {
    player: Player;
    direction: Direction;
}
