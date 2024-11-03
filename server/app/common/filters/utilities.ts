import { Player } from '@app/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';

export function isAnotherPlayerPresentOnTile(position: Vec2, players: Player[]): boolean {
    return players.some((player) => player.playerInGame.currentPosition.x === position.x && player.playerInGame.currentPosition.y === position.y);
}
