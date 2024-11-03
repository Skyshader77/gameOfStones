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
            case JournalEntry.CombatStart:
                return this.combatStartJournal(room);
            // case JournalEntry.CombatAttack:
            //     message.content = this.fightAttackJournal(players[0], players[1]);
            //     break;
            // case JournalEntry.CombatEvade:
            //     message.content = this.fightEvadeJournal(players[0], players[1]);
            //     break;
            // case JournalEntry.CombatEnd:
            //     message.content = this.fightEndJournal();
            //     break;
            // case JournalEntry.PlayerAbandon:
            //     message.content = this.abandonJournal();
            //     break;
            // case JournalEntry.PlayerWin:
            //     message.content = this.playerWinJournal();
            //     break;
            // case JournalEntry.GameEnd:
            //     message.content = this.gameEndJournal();
            //     break;
            default:
                return null;
        }
    }

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
            entry: JournalEntry.CombatStart,
            players: [room.game.currentPlayer, opponent.playerInfo.userName],
        };
    }

    private fightAttackJournal(attackerName: string, defenderName: string): string {
        return attackerName + ' a attaque ' + defenderName;
    }

    private fightEvadeJournal(attackerName: string, defenderName: string): string {
        return attackerName + ' a esquiver ' + defenderName;
    }

    private fightEndJournal(): string {
        return 'combat terminee';
    }

    private abandonJournal(): string {
        return 'abandon';
    }

    private playerWinJournal(): string {
        return 'player win';
    }

    private gameEndJournal(): string {
        return 'partie terminee';
    }
}
