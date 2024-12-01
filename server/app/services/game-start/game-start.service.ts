import { RoomGame } from '@app/interfaces/room-game';
import { MAP_PLAYER_CAPACITY, MINIMAL_PLAYER_CAPACITY } from '@common/constants/game-map.constants';
import { GameStatus } from '@common/enums/game-status.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { PlayerStartPosition } from '@common/interfaces/game-start-info';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { scrambleArray } from '@app/utils/utilities';

@Injectable()
export class GameStartService {
    constructor(private gameStatsService: GameStatsService) {}

    startGame(room: RoomGame, organizer: Player): PlayerStartPosition[] | null {
        if (this.isGameStartValid(room, organizer)) {
            room.game.status = GameStatus.OverWorld;
            const playerNames = this.determinePlayOrder(room);
            const orderedStarts = this.determineStartPosition(room, playerNames);
            this.filterStarts(room, orderedStarts);
            room.game.stats = this.gameStatsService.getGameStartStats(room.game.map, room.players);
            return orderedStarts;
        }

        return null;
    }

    private isGameStartValid(room: RoomGame, organizer: Player): boolean {
        return (
            room.players.length <= MAP_PLAYER_CAPACITY[room.game.map.size] &&
            room.players.length >= MINIMAL_PLAYER_CAPACITY &&
            organizer.playerInfo.role === PlayerRole.Organizer &&
            room.room.isLocked
        );
    }

    private determinePlayOrder(room: RoomGame): string[] {
        scrambleArray(room.players);

        room.players = room.players.sort((a, b) => b.playerInGame.attributes.speed - a.playerInGame.attributes.speed);
        const sortedPlayerNames = room.players.map((player) => {
            return player.playerInfo.userName;
        });

        return sortedPlayerNames;
    }

    private determineStartPosition(room: RoomGame, playOrder: string[]): PlayerStartPosition[] {
        const starts: Vec2[] = [];

        room.game.map.placedItems.forEach((item) => {
            if (item.type === ItemType.Start) {
                starts.push(item.position);
            }
        });

        const orderedStarts: PlayerStartPosition[] = [];

        playOrder.forEach((playerName) => {
            const startId = randomInt(0, starts.length);
            const startPosition = starts.splice(startId, 1)[0];
            const player = room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === playerName);
            player.playerInGame.startPosition = startPosition;
            const currentPosition = { x: startPosition.x, y: startPosition.y };
            player.playerInGame.currentPosition = currentPosition;
            player.playerInGame.remainingMovement = player.playerInGame.attributes.speed;
            orderedStarts.push({ userName: playerName, startPosition });
        });

        return orderedStarts;
    }

    private filterStarts(room: RoomGame, starts: PlayerStartPosition[]) {
        room.game.map.placedItems = room.game.map.placedItems.filter((item) => {
            if (item.type !== ItemType.Start) return true;

            return starts.some(
                (startPosition) => startPosition.startPosition.x === item.position.x && startPosition.startPosition.y === item.position.y,
            );
        });
    }
}
