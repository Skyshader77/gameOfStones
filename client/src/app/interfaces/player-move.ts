import { Direction } from '@common/interfaces/move';
import { Player } from './player';

export interface PlayerMove {
    player: Player;
    direction: Direction;
}
