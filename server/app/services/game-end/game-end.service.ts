import { MAXIMUM_NUMBER_OF_VICTORIES } from '@app/constants/gameplay.constants';
import { GameEndOutput } from '@app/interfaces/gameplay';
import { Player } from '@app/interfaces/player';
import { RoomGame } from '@app/interfaces/room-game';
import { GameMode } from '@common/enums/game-mode.enum';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameEndService {
    hasGameEnded(room: RoomGame): GameEndOutput {
        let gameEndResult: GameEndOutput;

        if (room.game.mode === GameMode.NORMAL) {
            gameEndResult = this.isClassicGameFinished(room.players);
        } else if (room.game.mode === GameMode.CTF) {
            gameEndResult = this.isCTFGameFinished();
        }

        return gameEndResult;
    }

    haveAllButOnePlayerAbandoned(players: Player[]): boolean {
        let countPlayersInGame = 0;

        for (const player of players) {
            if (!player.playerInGame.hasAbandonned) {
                countPlayersInGame++;
            }
        }

        return countPlayersInGame > 1;
    }

    private isClassicGameFinished(players: Player[]): GameEndOutput {
        let hasAchievedThreeVictories = false;
        let winningPlayerName: string | null = null;

        for (const player of players) {
            if (player.statistics.numbVictories >= MAXIMUM_NUMBER_OF_VICTORIES) {
                hasAchievedThreeVictories = true;
                winningPlayerName = player.playerInfo.userName;
                break;
            }
        }

        return { hasGameEnded: hasAchievedThreeVictories, winningPlayerName };
    }

    private isCTFGameFinished(): GameEndOutput {
        const isFlagOnStartPosition = false;
        const winningPlayerName: string | null = null;

        return { hasGameEnded: isFlagOnStartPosition, winningPlayerName };
    }
}
