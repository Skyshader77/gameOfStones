import { PathNode } from '@common/interfaces/move';
import { Player } from './player';

export interface PlayerMove {
    player: Player;
    node: PathNode;
}
