import { MAXIUM_NUMBER_OF_VICTORIES } from '@app/constants/gameplay.constants';
import { GameEndOutput } from '@app/interfaces/gameplay';
import { Player } from '@app/interfaces/player';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GameEndService {
  constructor(private roomManagerService: RoomManagerService) {}

  hasGameEnded(roomCode: string): GameEndOutput {
    const room = this.roomManagerService.getRoom(roomCode);
    const resultVictoryCheck = this.doesOnePlayerHaveThreeVictories(room.players);
    const resultAbandonCheck = this.haveAllButOnePlayerAbandonned(room.players);

    if (resultAbandonCheck.hasGameEnded || resultVictoryCheck.hasGameEnded) {
      return resultAbandonCheck.hasGameEnded
        ? resultAbandonCheck
        : resultVictoryCheck;
    }

    return resultVictoryCheck;
  }

  doesOnePlayerHaveThreeVictories(players: Player[]): GameEndOutput {
    let hasAchievedThreeVictories = false;
    let winningPlayerName: string | null = null;

    for (const player of players) {
      if (player.statistics.numbVictories >= MAXIUM_NUMBER_OF_VICTORIES) {
        hasAchievedThreeVictories = true;
        winningPlayerName = player.playerInfo.userName;
        break;
      }
    }

    return { hasGameEnded: hasAchievedThreeVictories, winningPlayerName };
  }

  haveAllButOnePlayerAbandonned(players: Player[]): GameEndOutput {
    let isRemainingPlayerAlone = false;
    let countPlayersInGame = 0;
    let winningPlayerName: string | null = null;

    for (const player of players) {
      if (!player.playerInGame.hasAbandonned) {
        countPlayersInGame++;
        winningPlayerName = player.playerInfo.userName;
      }
    }

    if (countPlayersInGame === 1) {
      isRemainingPlayerAlone = true;
    }

    return { hasGameEnded: isRemainingPlayerAlone, winningPlayerName };
  }
}
