import { Injectable } from '@nestjs/common';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { JournalLog } from '@common/interfaces/message';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { RoomGame } from '@app/interfaces/room-game';
import { AttackResult } from '@common/interfaces/fight';
import {
    ABANDON_LOG,
    AND,
    ATTACK_DICE_LOG,
    ATTACK_LOG,
    BECAUSE,
    CLOSED_DOOR_LOG,
    COMMA,
    DAMAGE_RESULT_LOG,
    DEFENSE_DICE_LOG,
    EVASION_LOG,
    FAILED_EVASION_LOG,
    FIGHT_NO_WINNER_LOG,
    FIGHT_WINNER_LOG,
    GAME_END_LOG,
    INFLICT_DAMAGE_LOG,
    LAST_STANDING_LOG,
    NO_DAMAGE_LOG,
    NO_DAMAGE_RESULT_LOG,
    OPEN_DOOR_LOG,
    START_FIGHT_LOG,
    SUCCESS_EVASION_LOG,
    THEN,
    TURN_START_LOG,
    WINNER_LOG,
} from '@app/constants/journal.constants';

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
        const rolls = ATTACK_DICE_LOG + attackResult.attackRoll + DEFENSE_DICE_LOG + attackResult.defenseRoll;
        const calculation =
            fight.fighters[fight.currentFighter].playerInGame.attributes.attack +
            ' + ' +
            attackResult.attackRoll +
            ' - (' +
            fight.fighters[(fight.currentFighter + 1) % 2].playerInGame.attributes.defense +
            ' + ' +
            attackResult.defenseRoll +
            ')' +
            (attackResult.hasDealtDamage ? DAMAGE_RESULT_LOG : NO_DAMAGE_RESULT_LOG);
        const conclusion =
            fight.fighters[fight.currentFighter].playerInfo.userName +
            (attackResult.hasDealtDamage ? INFLICT_DAMAGE_LOG : NO_DAMAGE_LOG) +
            fight.fighters[(fight.currentFighter + 1) % 2].playerInfo.userName;

        return {
            message: {
                content: rolls + BECAUSE + calculation + THEN + conclusion,
                time: new Date(),
            },
            entry: JournalEntry.FightAttackResult,
            players: fight.fighters.map((fighter) => fighter.playerInfo.userName),
        };
    }

    fightEvadeResultJournal(room: RoomGame, evasionSuccessful: boolean): JournalLog {
        const fight = room.game.fight;
        const content =
            fight.fighters[fight.currentFighter].playerInfo.userName +
            (evasionSuccessful ? SUCCESS_EVASION_LOG : FAILED_EVASION_LOG + fight.numbEvasionsLeft[fight.currentFighter]);
        return {
            message: {
                content,
                time: new Date(),
            },
            entry: JournalEntry.FightEvadeResult,
            players: [fight.fighters[fight.currentFighter].playerInfo.userName],
        };
    }

    abandonJournal(deserterName: string): JournalLog {
        return {
            message: {
                content: deserterName + ABANDON_LOG,
                time: new Date(),
            },
            entry: JournalEntry.PlayerAbandon,
            players: [deserterName],
        };
    }

    private turnStartJournal(room: RoomGame): JournalLog {
        return {
            message: {
                content: TURN_START_LOG + room.game.currentPlayer,
                time: new Date(),
            },
            entry: JournalEntry.TurnStart,
            players: [room.game.currentPlayer],
        };
    }

    private doorOpenedJournal(room: RoomGame): JournalLog {
        return {
            message: {
                content: room.game.currentPlayer + OPEN_DOOR_LOG,
                time: new Date(),
            },
            entry: JournalEntry.DoorOpen,
            players: [room.game.currentPlayer],
        };
    }

    private doorClosedJournal(room: RoomGame): JournalLog {
        return {
            message: {
                content: room.game.currentPlayer + CLOSED_DOOR_LOG,
                time: new Date(),
            },
            entry: JournalEntry.DoorClose,
            players: [room.game.currentPlayer],
        };
    }

    private combatStartJournal(room: RoomGame): JournalLog {
        const opponent = room.game.fight.fighters.find((fighter) => fighter.playerInfo.userName !== room.game.currentPlayer);
        return {
            message: {
                content: room.game.currentPlayer + START_FIGHT_LOG + opponent.playerInfo.userName,
                time: new Date(),
            },
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
                    ATTACK_LOG +
                    fight.fighters[(fight.currentFighter + 1) % 2].playerInfo.userName,
                time: new Date(),
            },
            entry: JournalEntry.FightAttack,
            players: fight.fighters.map((fighter) => fighter.playerInfo.userName),
        };
    }

    private fightEvadeJournal(room: RoomGame): JournalLog {
        const fight = room.game.fight;
        return {
            message: {
                content: fight.fighters[fight.currentFighter].playerInfo.userName + EVASION_LOG,
                time: new Date(),
            },
            entry: JournalEntry.FightAttack,
            players: [fight.fighters[fight.currentFighter].playerInfo.userName],
        };
    }

    private fightEndJournal(room: RoomGame): JournalLog {
        const fight = room.game.fight;
        const content = fight.result.winner
            ? fight.result.winner + FIGHT_WINNER_LOG + fight.result.loser
            : fight.fighters[0].playerInfo.userName + AND + fight.fighters[1].playerInfo.userName + FIGHT_NO_WINNER_LOG;
        return {
            message: {
                content,
                time: new Date(),
            },
            entry: JournalEntry.FightStart,
            players: fight.fighters.map((fighter) => fighter.playerInfo.userName),
        };
    }

    private playerWinJournal(room: RoomGame): JournalLog {
        return {
            message: {
                content: room.game.winner + WINNER_LOG,
                time: new Date(),
            },
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
                    content += AND;
                } else if (index < remainingPlayers.length - 1) {
                    content += COMMA;
                }
            }
        });
        return {
            message: {
                content: content + (remainingPlayers.length > 1 ? GAME_END_LOG : LAST_STANDING_LOG),
                time: new Date(),
            },
            entry: JournalEntry.PlayerWin,
            players: remainingPlayers.map((player) => player.playerInfo.userName),
        };
    }
}
