import { Injectable } from '@nestjs/common';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { JournalLog, Message } from '@common/interfaces/message';
import { Player } from '@app/interfaces/player';
import { JournalEntry } from '@common/enums/journal-entry.enum';

@Injectable()
export class JournalManagerService {
    constructor(private roomManagerService: RoomManagerService) {}

    addJournalToRoom(log: JournalLog, roomCode: string) {
        this.roomManagerService.getRoom(roomCode).journal.push(log);
    }

    generateJournal(journalEntry: JournalEntry, players: string[]): Message {
        const message: Message = { content: '', time: new Date() };
        switch (journalEntry) {
            case JournalEntry.TurnStart:
                message.content = this.turnStartJournal(players[0]);
                break;
            case JournalEntry.DoorOpen:
                message.content = this.doorToggleJournal(players[0]);
                break;
            case JournalEntry.CombatStart:
                message.content = this.fightStartJournal(players[0], players[1]);
                break;
            case JournalEntry.CombatAttack:
                message.content = this.fightAttackJournal(players[0], players[1]);
                break;
            case JournalEntry.CombatEvade:
                message.content = this.fightEvadeJournal(players[0], players[1]);
                break;
            case JournalEntry.CombatEnd:
                message.content = this.fightEndJournal();
                break;
            case JournalEntry.PlayerAbandon:
                message.content = this.abandonJournal();
                break;
            case JournalEntry.PlayerWin:
                message.content = this.playerWinJournal();
                break;
            case JournalEntry.GameEnd:
                message.content = this.gameEndJournal();
                break;
            default:
                message.content = 'Pas encore fait!';
        }

        return message;
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

    private turnStartJournal(currentPlayerName: string): string {
        return "C'est le debut du tour a " + currentPlayerName;
    }

    private doorToggleJournal(currentPlayerName: string): string {
        return currentPlayerName + ' a joue avec la porte.';
    }

    private fightStartJournal(attackerName: string, defenderName: string): string {
        return attackerName + ' a commence un combat contre ' + defenderName;
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
