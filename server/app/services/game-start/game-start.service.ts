import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { MAP_PLAYER_CAPACITY, MINIMAL_PLAYER_CAPACITY } from '@common/constants/game-map.constants';
import { PlayerRole } from '@common/constants/player.constants';
import { ItemType } from '@common/enums/item-type.enum';
import { PlayerStartPosition } from '@common/interfaces/game-start-info';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';

@Injectable()
export class GameStartService {
    startGame(room: RoomGame, organizer: Player): PlayerStartPosition[] | null {
        if (this.isGameStartValid(room, organizer)) {
            const playerNames = this.determinePlayOrder(room);
            const orderedStarts = this.determineStartPosition(room, playerNames);
            return orderedStarts;
        }

        return null;
    }

    // TODO maybe pass error messages here?
    private isGameStartValid(room: RoomGame, organizer: Player): boolean {
        return (
            room.players.length <= MAP_PLAYER_CAPACITY[room.game.map.size] &&
            room.players.length >= MINIMAL_PLAYER_CAPACITY &&
            organizer.playerInfo.role === PlayerRole.ORGANIZER &&
            room.room.isLocked
        );
    }

    private determinePlayOrder(room: RoomGame): string[] {
        for (let i = room.players.length - 1; i > 0; i--) {
            const j = randomInt(0, i + 1);
            const temp = room.players[i];
            room.players[i] = room.players[j];
            room.players[j] = temp;
        }

        room.players = room.players.sort((a, b) => b.playerInGame.movementSpeed - a.playerInGame.movementSpeed);
        const sortedPlayerNames = room.players.map((player) => {
            return player.playerInfo.userName;
        });

        return sortedPlayerNames;
    }

    private determineStartPosition(room: RoomGame, playOrder: string[]): PlayerStartPosition[] {
        const starts: Vec2[] = [];

        room.game.map.placedItems.forEach((item) => {
            if (item.type === ItemType.START) {
                starts.push(item.position);
            }
        });

        const orderedStarts: PlayerStartPosition[] = [];

        playOrder.forEach((playerName) => {
            const startId = randomInt(0, starts.length);
            const startPosition = starts.splice(startId, 1)[0];
            const player = room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === playerName);
            player.playerInGame.startPosition = startPosition;
            orderedStarts.push({ userName: playerName, startPosition });
        });

        return orderedStarts;
    }
}
