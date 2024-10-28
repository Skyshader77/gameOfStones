import { GameStartInformation } from '@app/interfaces/game-start';
import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { PlayerRole } from '@common/constants/player.constants';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';

@Injectable()
export class GameStartService {
    startGame(room: RoomGame, organizer: Player): GameStartInformation[] | null {
        if (this.isGameStartValid(room, organizer)) {
            const playerNames = this.determinePlayOrder(room);
            const orderedStarts = this.determineStartPosition(room, playerNames);
            return orderedStarts;
        }

        return null;
    }

    // TODO check that the room is locked
    // TODO check for the correct player count. low for now to let 1 player to play for tests
    // TODO check if all checks are done
    private isGameStartValid(room: RoomGame, organizer: Player): boolean {
        return room.players.length > 0 && organizer.playerInfo.role === PlayerRole.ORGANIZER; // && room.isLocked;
    }

    private determinePlayOrder(room: RoomGame): string[] {
        // TODO shuffle the players for a random order.
        room.players = room.players.sort((a, b) => b.playerInGame.movementSpeed - a.playerInGame.movementSpeed);
        const sortedPlayerNames = room.players.map((player) => {
            return player.playerInfo.userName;
        });

        return sortedPlayerNames;
    }

    private determineStartPosition(room: RoomGame, playOrder: string[]): GameStartInformation[] {
        const starts: Vec2[] = [];

        playOrder.forEach(() => {
            starts.push({ x: 0, y: 0 });
        });

        // TODO use the real map when the creation passes the actual map
        // room.game.map.mapArray.forEach((row, j) => {
        //     row.forEach((tile, i) => {
        //         if (tile.item === Item.START) {
        //             starts.push({ x: i, y: j });
        //         }
        //     });
        // });

        const orderedStarts: GameStartInformation[] = [];

        playOrder.forEach((playerName) => {
            const startId = randomInt(starts.length);
            const startPosition = starts.splice(startId, 1)[0];
            const player = room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === playerName);
            player.playerInGame.startPosition = startPosition;
            orderedStarts.push({ userName: playerName, startPosition });
        });

        return orderedStarts;
    }
}
