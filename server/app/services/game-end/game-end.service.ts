import { MAXIMUM_NUMBER_OF_VICTORIES } from '@app/constants/gameplay.constants';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { GameEndOutput } from '@app/interfaces/game-end';
import { RoomGame } from '@app/interfaces/room-game';
import { GameStatsService } from '@app/services/game-stats/game-stats.service';
import { GameMode } from '@common/enums/game-mode.enum';
import { GameStatus } from '@common/enums/game-status.enum';
import { ItemType } from '@common/enums/item-type.enum';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { GameEndInfo } from '@common/interfaces/game-gateway-outputs';
import { Player } from '@common/interfaces/player';
import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class GameEndService {
    constructor(
        private gameStatsService: GameStatsService,
        private messagingGateway: MessagingGateway,
    ) {}
    hasGameEnded(room: RoomGame): GameEndOutput {
        const gameEndOutput: GameEndOutput = { hasEnded: false, winnerName: null, endStats: null };

        const players = room.players;
        let index = 0;

        while (!gameEndOutput.hasEnded && index < players.length) {
            const ended =
                room.game.mode === GameMode.Normal ? this.isPlayerClassicGameWinner(players[index]) : this.isPlayerCTFGameWinner(players[index]);

            if (ended) {
                gameEndOutput.hasEnded = true;
                gameEndOutput.winnerName = players[index].playerInfo.userName;
                gameEndOutput.endStats = this.gameStatsService.getGameEndStats(room.game.stats, players);
            }
            index++;
        }

        return gameEndOutput;
    }

    endGame(room: RoomGame, endResult: GameEndOutput, server: Server) {
        room.game.winner = endResult.winnerName;
        room.game.status = GameStatus.Finished;
        this.messagingGateway.sendPublicJournal(room, JournalEntry.PlayerWin);
        this.messagingGateway.sendPublicJournal(room, JournalEntry.GameEnd);
        server.to(room.room.roomCode).emit(GameEvents.EndGame, { winnerName: endResult.winnerName, endStats: endResult.endStats } as GameEndInfo);
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
