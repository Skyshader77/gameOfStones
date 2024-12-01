import { TIMER_RESOLUTION_MS } from '@app/constants/time.constants';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { RoomGame } from '@app/interfaces/room-game';
import { FightLogicService } from '@app/services/fight/fight-logic/fight-logic.service';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { ItemManagerService } from '@app/services/item-manager/item-manager.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { VirtualPlayerHelperService } from '@app/services/virtual-player-helper/virtual-player-helper.service';
import { isPlayerHuman } from '@app/utils/utilities';
import { GameStatus } from '@common/enums/game-status.enum';
import { Gateway } from '@common/enums/gateway.enum';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { AttackResult } from '@common/interfaces/fight';
import { DeadPlayerPayload, Player } from '@common/interfaces/player';
import { Inject, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FightManagerService {
    @Inject() private fightService: FightLogicService;
    @Inject() private gameTimeService: GameTimeService;
    @Inject() private messagingGateway: MessagingGateway;
    @Inject() private socketManagerService: SocketManagerService;
    @Inject() private itemManagerService: ItemManagerService;
    @Inject() private virtualPlayerHelperService: VirtualPlayerHelperService;

    @Inject(RoomManagerService)
    private roomManagerService: RoomManagerService;

    private readonly logger = new Logger(FightManagerService.name);

    startFight(room: RoomGame, opponentName: string) {
        if (this.fightService.isFightValid(room, opponentName)) {
            this.initializeFightState(room, opponentName);
            this.broadcastFightStart(room);
            if (this.virtualPlayerHelperService.areTwoAIsFighting(room)) {
                this.startFightTurn(room);
            }
        }
    }

    handleDesireAttack(room: RoomGame, playerName: string) {
        if (this.fightService.isCurrentFighter(room.game.fight, playerName)) {
            room.game.fight.hasPendingAction = true;
            this.fighterAttack(room);
        }
    }

    startFightTurn(room: RoomGame) {
        const nextFighterName = this.fightService.nextFightTurn(room.game.fight);
        if (this.virtualPlayerHelperService.areTwoAIsFighting(room)) {
            this.determineWhichAILost(room.game.fight.fighters, room);
            this.handleEndFightAction(room, nextFighterName);
            return;
        }

        const turnTime = this.fightService.getTurnTime(room.game.fight);
        room.game.fight.fighters.forEach((fighter) => {
            if (isPlayerHuman(fighter)) {
                const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, fighter.playerInfo.userName, Gateway.Fight);
                if (socket) {
                    socket.emit(GameEvents.StartFightTurn, { currentFighter: nextFighterName, time: turnTime });
                }
            } else if (fighter.playerInfo.userName === nextFighterName) this.startVirtualPlayerFightTurn(room, fighter);
        });
        this.gameTimeService.startTimer(room.game.fight.timer, turnTime);
    }

    fighterAttack(room: RoomGame) {
        this.messagingGateway.sendGenericPrivateJournal(room, JournalEntry.FightAttack);
        const attackResult = this.fightService.attack(room);
        this.messagingGateway.sendAttackResultJournal(room, attackResult);
        this.notifyFightersOfAttack(room, attackResult);
    }

    fighterEscape(room: RoomGame) {
        this.messagingGateway.sendGenericPrivateJournal(room, JournalEntry.FightEvade);
        const escapeResult = this.fightService.escape(room);
        this.notifyFightersOfEscape(room, escapeResult);
        this.messagingGateway.sendEvasionResultJournal(room, escapeResult);
    }

    fightEnd(room: RoomGame) {
        const server = this.socketManagerService.getGatewayServer(Gateway.Fight);
        room.game.hasPendingAction = false;
        this.fightService.endFight(room);
        if (room.game.fight.timer && room.game.fight.timer.timerSubscription) {
            this.gameTimeService.stopTimer(room.game.fight.timer);
            room.game.fight.timer.timerSubscription.unsubscribe();
        }
        this.messagingGateway.sendGenericPublicJournal(room, JournalEntry.FightEnd);
        server.to(room.room.roomCode).emit(GameEvents.FightEnd, room.game.fight.result);
    }

    handleEndFightAction(room: RoomGame, playerName: string) {
        const fight = room.game.fight;
        if (this.fightService.isCurrentFighter(fight, playerName) || this.virtualPlayerHelperService.isCurrentFighterAI(room, playerName)) {
            if (fight.isFinished) {
                this.handleFightCompletion(room);
            } else {
                this.startFightTurn(room);
            }
        }
    }

    remainingFightTime(room: RoomGame, count: number) {
        if (!room.game.fight?.fighters) {
            return;
        }
        room.game.fight.fighters.forEach((fighter) => {
            const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, fighter.playerInfo.userName, Gateway.Game);
            if (socket) {
                socket.emit(GameEvents.RemainingTime, count);
            }
        });

        if (room.game.fight.timer.counter === 0) {
            room.game.fight.hasPendingAction = false;
            setTimeout(() => {
                if (room.game.fight && !room.game.fight.isFinished && !room.game.fight.hasPendingAction) {
                    this.fighterAttack(room);
                }
            }, TIMER_RESOLUTION_MS);
        }
    }

    processFighterAbandonment(room: RoomGame, abandonedFighterName: string) {
        const winningPlayer = room.game.fight.fighters.find((player) => player.playerInfo.userName !== abandonedFighterName);
        const abandonedPlayer = room.players.find((player) => player.playerInfo.userName === abandonedFighterName);
        if (winningPlayer && abandonedPlayer) {
            this.fightService.setFightResult(room, winningPlayer, abandonedPlayer);
        }
        this.fightEnd(room);
    }

    isInFight(room: RoomGame, abandonedFighterName: string): boolean {
        return !room.game.fight ? false : room.game.fight.fighters.some((fighter) => fighter.playerInfo.userName === abandonedFighterName);
    }

    hasLostFight(room: RoomGame): boolean {
        const currentPlayer = room.players.find((roomPlayer) => roomPlayer.playerInfo.userName === room.game.currentPlayer);
        if (!room.game.fight) {
            return false;
        } else {
            return currentPlayer.playerInfo.userName === room.game.fight.result.loser;
        }
    }

    setupFightTimer(room: RoomGame): void {
        room.game.fight.timer = this.gameTimeService.getInitialTimer();
        this.startFightTurn(room);
        room.game.fight.timer.timerSubscription = this.gameTimeService.getTimerSubject(room.game.fight.timer).subscribe((counter: number) => {
            this.remainingFightTime(room, counter);
        });
    }

    // TODO check
    private startVirtualPlayerFightTurn(room: RoomGame, fighter: Player) {
        const fighterIndex = room.game.fight.currentFighter;

        setTimeout(() => {
            if (room.game.fight) {
                room.game.fight.hasPendingAction = true;

                if (this.shouldEscape(fighter, fighterIndex, room)) {
                    this.fighterEscape(room);
                } else {
                    this.fighterAttack(room);
                }
            }
        }, this.virtualPlayerHelperService.getRandomAIActionInterval());
    }

    // TODO check
    private shouldEscape(fighter: Player, fighterIndex: number, room: RoomGame): boolean {
        const hasEvasionsLeft = room.game.fight.numbEvasionsLeft[fighterIndex] > 0;
        const isDefensiveAI = fighter.playerInfo.role === PlayerRole.DefensiveAI;
        const isInjured = fighter.playerInGame.remainingHp < fighter.playerInGame.baseAttributes.hp;

        return hasEvasionsLeft && isDefensiveAI && isInjured;
    }

    private handleFightCompletion(room: RoomGame): void {
        const server = this.socketManagerService.getGatewayServer(Gateway.Game);
        const fight = room.game.fight;

        const loserPlayer = room.players.find((player) => player.playerInfo.userName === fight.result.loser);
        if (loserPlayer) {
            const fightLoserResult = this.handlePlayerLoss(loserPlayer, room);
            server.to(room.room.roomCode).emit(GameEvents.PlayerDead, fightLoserResult);
        }
        this.fightEnd(room);
        this.resetFightersHealth(fight.fighters);
    }

    private resetFightersHealth(fighters: Player[]): void {
        fighters.forEach((fighter) => {
            fighter.playerInGame.remainingHp = fighter.playerInGame.attributes.hp;
        });
    }

    private broadcastFightStart(room: RoomGame): void {
        const server = this.socketManagerService.getGatewayServer(Gateway.Fight);
        const fightOrder = this.getFightOrder(room);

        server.to(room.room.roomCode).emit(GameEvents.StartFight, fightOrder);
        this.messagingGateway.sendGenericPublicJournal(room, JournalEntry.FightStart);
    }

    private getFightOrder(room: RoomGame): string[] {
        return room.game.fight.fighters.map((fighter) => fighter.playerInfo.userName);
    }

    private initializeFightState(room: RoomGame, opponentName: string): void {
        this.fightService.initializeFight(room, opponentName);
        this.gameTimeService.stopTimer(room.game.timer);
        room.game.status = GameStatus.Fight;
    }

    private handlePlayerLoss(loserPlayer: Player, room: RoomGame) {
        if (loserPlayer.playerInfo.userName === this.roomManagerService.getCurrentRoomPlayer(room.room.roomCode).playerInfo.userName)
            room.game.isCurrentPlayerDead = true;
        const respawnPosition = {
            x: loserPlayer.playerInGame.startPosition.x,
            y: loserPlayer.playerInGame.startPosition.y,
        };

        this.itemManagerService.handleInventoryLoss(loserPlayer, room, null);
        loserPlayer.playerInGame.currentPosition = {
            x: respawnPosition.x,
            y: respawnPosition.y,
        };

        const fightLoserResult: DeadPlayerPayload = { player: loserPlayer, respawnPosition };
        return [fightLoserResult];
    }

    // TODO check
    private determineWhichAILost(fighters: Player[], room: RoomGame): void {
        const { loserIndex, winnerIndex } = this.virtualPlayerHelperService.determineAIBattleWinner();
        const [loser, winner] = [fighters[loserIndex], fighters[winnerIndex]];

        this.fightService.setFightResult(room, winner, loser);
    }

    private notifyFighters<T>(room: RoomGame, event: GameEvents, result: T): void {
        room.game.fight.fighters.forEach((fighter) => {
            const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, fighter.playerInfo.userName, Gateway.Fight);
            if (socket) {
                socket.emit(event, result);
            }
        });
    }

    private notifyFightersOfEscape(room: RoomGame, escapeResult: boolean): void {
        this.notifyFighters(room, GameEvents.FighterEvade, escapeResult);
    }

    private notifyFightersOfAttack(room: RoomGame, attackResult: AttackResult): void {
        this.notifyFighters(room, GameEvents.FighterAttack, attackResult);
    }
}
