import { Injectable } from '@nestjs/common';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { JournalLog } from '@common/interfaces/message';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { RoomGame } from '@app/interfaces/room-game';

@Injectable()
export class JournalManagerService {
    constructor(private roomManagerService: RoomManagerService) {}

    addJournalToRoom(log: JournalLog, roomCode: string) {
        this.roomManagerService.getRoom(roomCode).journal.push(log);
    }

    generateJournal(journalEntry: JournalEntry, room: RoomGame): JournalLog {
        switch (journalEntry) {
            case JournalEntry.TurnStart:
                return this.turnStartJournal(room);
            case JournalEntry.DoorOpen:
                return this.doorOpenedJournal(room);
            case JournalEntry.DoorClose:
                return this.doorClosedJournal(room);
            case JournalEntry.FightStart:
                return this.combatStartJournal(room);
            case JournalEntry.FightAttack:
                return this.fightAttackJournal(room);
            case JournalEntry.FightEvade:
                return this.fightEvadeJournal(room);
            case JournalEntry.FightEnd:
                return this.fightEndJournal(room);
            case JournalEntry.PlayerAbandon:
                return this.abandonJournal(room);
            case JournalEntry.PlayerWin:
                return this.playerWinJournal(room);
            case JournalEntry.GameEnd:
                return this.gameEndJournal(room);
            default:
                return null;
        }
    }

    // TODO result messages
    fightAttackResultJournal(): string {
        return 'resultat attaque';
    }

    fightEvadeResultJournal(): string {
        return 'resultat esquive: ';
    }

    fightResultJournal(): string {
        return 'combat terminee';
    }

    private turnStartJournal(room: RoomGame): JournalLog {
        return {
            message: {
                content: "C'est le debut du tour a " + room.game.currentPlayer,
                time: new Date(),
            },
            isPrivate: false,
            entry: JournalEntry.TurnStart,
            players: [room.game.currentPlayer],
        };
    }

    private doorOpenedJournal(room: RoomGame): JournalLog {
        return {
            message: {
                content: room.game.currentPlayer + ' a ouvert une porte.',
                time: new Date(),
            },
            isPrivate: false,
            entry: JournalEntry.DoorOpen,
            players: [room.game.currentPlayer],
        };
    }

    private doorClosedJournal(room: RoomGame): JournalLog {
        return {
            message: {
                content: room.game.currentPlayer + ' a ferme une porte.',
                time: new Date(),
            },
            isPrivate: false,
            entry: JournalEntry.DoorClose,
            players: [room.game.currentPlayer],
        };
    }

    private combatStartJournal(room: RoomGame): JournalLog {
        const opponent = room.game.fight.fighters.find((fighter) => fighter.playerInfo.userName !== room.game.currentPlayer);
        return {
            message: {
                content: room.game.currentPlayer + ' a commence un combat contre ' + opponent.playerInfo.userName,
                time: new Date(),
            },
            isPrivate: false,
            entry: JournalEntry.FightStart,
            players: [room.game.currentPlayer, opponent.playerInfo.userName],
        };
    }

    private fightAttackJournal(room: RoomGame): JournalLog {
        const fight = room.game.fight;
        return {
            message: {
                content:
                    fight.fighters[fight.currentFighter].playerInfo.userName +
                    ' tente une attaque contre ' +
                    fight.fighters[(fight.currentFighter + 1) % 2].playerInfo.userName,
                time: new Date(),
            },
            isPrivate: false,
            entry: JournalEntry.FightAttack,
            players: fight.fighters.map((fighter) => fighter.playerInfo.userName),
        };
    }

    private fightEvadeJournal(room: RoomGame): JournalLog {
        const fight = room.game.fight;
        return {
            message: {
                content: fight.fighters[fight.currentFighter].playerInfo.userName + ' tente une evasion',
                time: new Date(),
            },
            isPrivate: false,
            entry: JournalEntry.FightAttack,
            players: [fight.fighters[fight.currentFighter].playerInfo.userName],
        };
    }

    private fightEndJournal(room: RoomGame): JournalLog {
        const fight = room.game.fight;
        const content = fight.result.winner
            ? fight.result.winner + ' a vaincu ' + fight.result.loser
            : fight.fighters[0].playerInfo.userName + ' et ' + fight.fighters[1].playerInfo.userName + ' se sont perdu de vue...';
        return {
            message: {
                content,
                time: new Date(),
            },
            isPrivate: false,
            entry: JournalEntry.FightStart,
            players: fight.fighters.map((fighter) => fighter.playerInfo.userName),
        };
    }

    // TODO how to do this?
    private abandonJournal(room: RoomGame): JournalLog {
        return {
            message: {
                content: 'ok',
                time: new Date(),
            },
            isPrivate: false,
            entry: JournalEntry.PlayerAbandon,
            players: [room.game.currentPlayer],
        };
    }

    private playerWinJournal(room: RoomGame): JournalLog {
        return {
            message: {
                content: room.game.winner + ' est le vainceur!',
                time: new Date(),
            },
            isPrivate: false,
            entry: JournalEntry.PlayerWin,
            players: [room.game.winner],
        };
    }

    private gameEndJournal(room: RoomGame): JournalLog {
        let content = '';
        const remainingPlayers = room.players.filter((player) => !player.playerInGame.hasAbandoned);
        remainingPlayers.forEach((player, index) => {
            if (!player.playerInGame.hasAbandoned) {
                content += player.playerInfo.userName;
                if (index === remainingPlayers.length - 2) {
                    content += ' et ';
                } else if (index < remainingPlayers.length - 1) {
                    content += ', ';
                }
            }
        });
        return {
            message: {
                content: content + ' sont les derniers survivants.',
                time: new Date(),
            },
            isPrivate: false,
            entry: JournalEntry.PlayerWin,
            players: remainingPlayers.map((player) => player.playerInfo.userName),
        };
    }
}
