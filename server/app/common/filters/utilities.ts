import { RoomGame } from '@app/interfaces/room-game';
import { Vec2 } from '@common/interfaces/vec2';

export function isAnotherPlayerPresentOnTile(position: Vec2, room: RoomGame): boolean {
    return room.players.some(
        (player) => player.playerInGame.currentPosition.x === position.x && player.playerInGame.currentPosition.y === position.y,
    );
}
