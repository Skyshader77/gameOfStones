import { Injectable } from '@nestjs/common';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { JournalLog } from '@common/interfaces/message';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { RoomGame } from '@app/interfaces/room-game';
import { AttackResult } from '@common/interfaces/fight';

@Injectable()
export class JournalManagerService {
    constructor(private roomManagerService: RoomManagerService) {}

    addJournalToRoom(log: JournalLog, roomCode: string) {
        this.roomManagerService.getRoom(roomCode).journal.push(log);
    }

    generateJournal(journalEntry: JournalEntry, room: RoomGame): JournalLog | null {
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
            case JournalEntry.PlayerWin:
                return this.playerWinJournal(room);
            case JournalEntry.GameEnd:
                return this.gameEndJournal(room);
            default:
                return null;
        }
    }

    fightAttackResultJournal(room: RoomGame, attackResult: AttackResult): JournalLog {
        const fight = room.game.fight;
        const content = "Le de d'attaque donne " + attackResult.attackRoll + ' et le de de defense donne ' + attackResult.defenseRoll;
        const calculation =
            fight.fighters[fight.currentFighter].playerInGame.attributes.attack +
            ' + ' +
            attackResult.attackRoll +
            ' - (' +
            fight.fighters[(fight.currentFighter + 1) % 2].playerInGame.attributes.defense +
            ' + ' +
            attackResult.defenseRoll +
            ')' +
            (attackResult.hasDealtDamage ? ' > 0' : ' <= 0');
        const conclusion =
            fight.fighters[fight.currentFighter].playerInfo.userName +
            (attackResult.hasDealtDamage ? ' inflige des degats a ' : " n'inflige pas de degats a ") +
            fight.fighters[(fight.currentFighter + 1) % 2].playerInfo.userName;

        return {
            message: {
                content: content + '. Puisque ' + calculation + ', alors ' + conclusion,
                time: new Date(),
            },
            isPrivate: false,
            entry: JournalEntry.FightAttackResult,
            players: fight.fighters.map((fighter) => fighter.playerInfo.userName),
        };
    }

    fightEvadeResultJournal(room: RoomGame, evasionSuccessful: boolean): JournalLog {
        const fight = room.game.fight;
        const content = evasionSuccessful
            ? fight.fighters[fight.currentFighter].playerInfo.userName + ' a reussi son evasion'
            : fight.fighters[fight.currentFighter].playerInfo.userName +
              " a echoue son evasion. Il n'en reste que " +
              fight.numbEvasionsLeft[fight.currentFighter];
        return {
            message: {
                content,
                time: new Date(),
            },
            isPrivate: false,
            entry: JournalEntry.FightEvadeResult,
            players: [fight.fighters[fight.currentFighter].playerInfo.userName],
        };
    }

    abandonJournal(deserterName: string): JournalLog {
        return {
            message: {
                content: deserterName + ' a abandonne la partie',
                time: new Date(),
            },
            isPrivate: false,
            entry: JournalEntry.PlayerAbandon,
            players: [deserterName],
        };
    }

    private turnStartJournal(room: RoomGame): JournalLog {
        return {
            message: {
                content: "C'est le tour a " + room.game.currentPlayer,
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
