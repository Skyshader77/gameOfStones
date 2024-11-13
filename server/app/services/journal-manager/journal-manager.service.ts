import * as constants from '@app/constants/journal.constants';
import { ITEM_NAMES } from '@app/constants/journal.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { FightLogicService } from '@app/services/fight/fight/fight-logic.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { ItemType } from '@common/enums/item-type.enum';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { AttackResult } from '@common/interfaces/fight';
import { JournalLog } from '@common/interfaces/message';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JournalManagerService {
    constructor(
        private roomManagerService: RoomManagerService,
        private fightLogicService: FightLogicService,
    ) {}

    addJournalToRoom(log: JournalLog, roomCode: string) {
        const room = this.roomManagerService.getRoom(roomCode);
        if (room) {
            room.journal.push(log);
        }
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

    itemPickUpJournal(room: RoomGame, itemType: ItemType): JournalLog {
        const content = room.game.currentPlayer + constants.ITEM_GRAB_LOG + ITEM_NAMES[itemType];
        return {
            message: {
                content,
                time: new Date(),
            },
            entry: JournalEntry.ItemPickedup,
            players: [room.game.currentPlayer],
        };
    }

    fightAttackResultJournal(room: RoomGame, attackResult: AttackResult): JournalLog {
        const fight = room.game.fight;
        const rolls = constants.ATTACK_DICE_LOG + attackResult.attackRoll + constants.DEFENSE_DICE_LOG + attackResult.defenseRoll;
        const calculation =
            this.fightLogicService.getPlayerAttack(fight.fighters[fight.currentFighter], room) +
            ' + ' +
            attackResult.attackRoll +
            ' - (' +
            this.fightLogicService.getPlayerDefense(fight.fighters[(fight.currentFighter + 1) % 2], room) +
            ' + ' +
            attackResult.defenseRoll +
            ')' +
            (attackResult.hasDealtDamage ? constants.DAMAGE_RESULT_LOG : constants.NO_DAMAGE_RESULT_LOG);
        const conclusion =
            fight.fighters[fight.currentFighter].playerInfo.userName +
            (attackResult.hasDealtDamage ? constants.INFLICT_DAMAGE_LOG : constants.NO_DAMAGE_LOG) +
            fight.fighters[(fight.currentFighter + 1) % 2].playerInfo.userName;

        return {
            message: {
                content: rolls + constants.BECAUSE + calculation + constants.THEN + conclusion,
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
            (evasionSuccessful ? constants.SUCCESS_EVASION_LOG : constants.FAILED_EVASION_LOG + fight.numbEvasionsLeft[fight.currentFighter]);
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
                content: deserterName + constants.ABANDON_LOG,
                time: new Date(),
            },
            entry: JournalEntry.PlayerAbandon,
            players: [deserterName],
        };
    }

    private turnStartJournal(room: RoomGame): JournalLog {
        return {
            message: {
                content: constants.TURN_START_LOG + room.game.currentPlayer,
                time: new Date(),
            },
            entry: JournalEntry.TurnStart,
            players: [room.game.currentPlayer],
        };
    }

    private doorOpenedJournal(room: RoomGame): JournalLog {
        return {
            message: {
                content: room.game.currentPlayer + constants.OPEN_DOOR_LOG,
                time: new Date(),
            },
            entry: JournalEntry.DoorOpen,
            players: [room.game.currentPlayer],
        };
    }

    private doorClosedJournal(room: RoomGame): JournalLog {
        return {
            message: {
                content: room.game.currentPlayer + constants.CLOSED_DOOR_LOG,
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
                content: room.game.currentPlayer + constants.START_FIGHT_LOG + opponent.playerInfo.userName,
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
                    constants.ATTACK_LOG +
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
                content: fight.fighters[fight.currentFighter].playerInfo.userName + constants.EVASION_LOG,
                time: new Date(),
            },
            entry: JournalEntry.FightAttack,
            players: [fight.fighters[fight.currentFighter].playerInfo.userName],
        };
    }

    private fightEndJournal(room: RoomGame): JournalLog {
        const fight = room.game.fight;
        const content = fight.result.winner
            ? fight.result.winner + constants.FIGHT_WINNER_LOG + fight.result.loser
            : fight.fighters[0].playerInfo.userName + constants.AND + fight.fighters[1].playerInfo.userName + constants.FIGHT_NO_WINNER_LOG;
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
                content: room.game.winner + constants.WINNER_LOG,
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
                    content += constants.AND;
                } else if (index < remainingPlayers.length - 1) {
                    content += constants.COMMA;
                }
            }
        });
        return {
            message: {
                content: content + (remainingPlayers.length > 1 ? constants.GAME_END_LOG : constants.LAST_STANDING_LOG),
                time: new Date(),
            },
            entry: JournalEntry.PlayerWin,
            players: remainingPlayers.map((player) => player.playerInfo.userName),
        };
    }
}
