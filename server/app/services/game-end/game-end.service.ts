import { MAXIMUM_NUMBER_OF_VICTORIES } from '@app/constants/gameplay.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { GameMode } from '@common/enums/game-mode.enum';
import { Player } from '@common/interfaces/player';
import { Injectable } from '@nestjs/common';
import { ItemType } from '@common/enums/item-type.enum';
import { GameEndOutput } from '@app/interfaces/game-end';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';

@Injectable()
export class GameEndService {
    constructor(private gameStatsService: GameStatsService) {}
    hasGameEnded(room: RoomGame): GameEndOutput {
        const output: GameEndOutput = { hasEnded: false, winnerName: null, endStats: null };

        const players = room.players;
        let index = 0;

        while (!output.hasEnded && index < players.length) {
            const ended =
                room.game.mode === GameMode.Normal ? this.isPlayerClassicGameWinner(players[index]) : this.isPlayerCTFGameWinner(players[index]);

            if (ended) {
                output.hasEnded = true;
                output.winnerName = players[index].playerInfo.userName;
                output.endStats = this.gameStatsService.getGameEndStats(room.game.stats, players);
            }
            index++;
        }

        return output;
    }

    haveAllButOnePlayerAbandoned(players: Player[]): boolean {
        let countPlayersInGame = 0;

        for (const player of players) {
            if (!player.playerInGame.hasAbandoned) {
                countPlayersInGame++;
            }
        }

        return countPlayersInGame === 1;
    }

    private isPlayerClassicGameWinner(player: Player): boolean {
        return player.playerInGame.winCount >= MAXIMUM_NUMBER_OF_VICTORIES;
    }

    private isPlayerCTFGameWinner(player: Player): boolean {
        return (
            player.playerInGame.inventory.includes(ItemType.Flag) &&
            player.playerInGame.currentPosition.x === player.playerInGame.startPosition.x &&
            player.playerInGame.currentPosition.y === player.playerInGame.startPosition.y
        );
    }
}
