import { TIMER_RESOLUTION_MS } from '@app/constants/time.constants';
import { MAX_AI_FIGHT_ACTION_DELAY, MIN_AI_FIGHT_ACTION_DELAY } from '@app/constants/virtual-player.constants';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { RoomGame } from '@app/interfaces/room-game';
import { FightLogicService } from '@app/services/fight/fight-logic/fight-logic.service';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { ItemManagerService } from '@app/services/item-manager/item-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { isPlayerHuman } from '@app/utils/utilities';
import { GameStatus } from '@common/enums/game-status.enum';
import { Gateway } from '@common/enums/gateway.enum';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { AttackResult } from '@common/interfaces/fight';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class FightManagerService {
    @Inject(FightLogicService)
    private fightService: FightLogicService;

    @Inject(GameTimeService)
    private gameTimeService: GameTimeService;

    @Inject(MessagingGateway)
    private messagingGateway: MessagingGateway;

    @Inject(SocketManagerService)
    private socketManagerService: SocketManagerService;

    @Inject(ItemManagerService)
    private itemManagerService: ItemManagerService;

    private readonly logger = new Logger(FightManagerService.name);

    startFight(room: RoomGame, opponentName: string) {
        if (this.fightService.isFightValid(room, opponentName)) {
            this.initializeFightState(room, opponentName);
            this.broadcastFightStart(room);
            this.startFightTurn(room);
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
        if (this.areTwoAIsFighting(room)) {
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
        this.gameTimeService.stopTimer(room.game.fight.timer);
        room.game.fight.timer.timerSubscription.unsubscribe();
        this.messagingGateway.sendGenericPublicJournal(room, JournalEntry.FightEnd);
        server.to(room.room.roomCode).emit(GameEvents.FightEnd, room.game.fight.result);
    }

    handleEndFightAction(room: RoomGame, playerName: string) {
        const fight = room.game.fight;
        if (this.fightService.isCurrentFighter(fight, playerName) || this.isCurrentFighterAI(room, playerName)) {
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
            this.updateFightResult(room, winningPlayer, abandonedPlayer);
        }
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

    private startVirtualPlayerFightTurn(room: RoomGame, fighter: Player) {
        const fighterIndex = room.game.fight.currentFighter;

        const randomInterval = Math.floor(Math.random() * (MAX_AI_FIGHT_ACTION_DELAY - MIN_AI_FIGHT_ACTION_DELAY + 1)) + MIN_AI_FIGHT_ACTION_DELAY;
        setTimeout(() => {
            if (room.game.fight) {
                room.game.fight.hasPendingAction = true;

                if (this.shouldEscape(fighter, fighterIndex, room)) {
                    this.fighterEscape(room);
                } else {
                    this.fighterAttack(room);
                }
            }
        }, randomInterval);
    }

    private shouldEscape(fighter: Player, fighterIndex: number, room: RoomGame): boolean {
        const hasEvasionsLeft = room.game.fight.numbEvasionsLeft[fighterIndex] > 0;
        const isDefensiveAI = fighter.playerInfo.role === PlayerRole.DefensiveAI;
        const isInjured = fighter.playerInGame.remainingHp < fighter.playerInGame.baseAttributes.hp;

        return hasEvasionsLeft && isDefensiveAI && isInjured;
    }
    private handleFightCompletion(room: RoomGame): void {
        const fight = room.game.fight;

        const loserPlayer = room.players.find((player) => player.playerInfo.userName === fight.result.loser);
        if (loserPlayer) {
            this.handlePlayerLoss(loserPlayer, room);
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

    private areTwoAIsFighting(room: RoomGame): boolean {
        if (!room.game.fight) {
            return false;
        }
        return !room.game.fight.fighters.some((fighter) => isPlayerHuman(fighter));
    }

    private handlePlayerLoss(loserPlayer: Player, room: RoomGame) {
        const loserPositions: Vec2 = JSON.parse(
            JSON.stringify({ x: loserPlayer.playerInGame.currentPosition.x, y: loserPlayer.playerInGame.currentPosition.y }),
        );
        this.handleInventoryLoss(loserPlayer, room, loserPositions);
        loserPlayer.playerInGame.currentPosition = {
            x: room.game.fight.result.respawnPosition.x,
            y: room.game.fight.result.respawnPosition.y,
        };
    }

    private determineWhichAILost(fighters: Player[], room: RoomGame): void {
        const { loserIndex, winnerIndex } = this.determineAIBattleWinner();
        const [loser, winner] = [fighters[loserIndex], fighters[winnerIndex]];

        this.updateFightResult(room, winner, loser);
        this.setRespawnPosition(room, loser);
    }

    private handleInventoryLoss(player: Player, room: RoomGame, dropPosition: Vec2): void {
        player.playerInGame.inventory.forEach((item) => {
            this.itemManagerService.handleItemLost({
                room,
                playerName: player.playerInfo.userName,
                itemDropPosition: dropPosition,
                itemType: item,
            });
        });
    }

    private determineAIBattleWinner(): { loserIndex: number; winnerIndex: number } {
        const loserIndex = Math.floor(Math.random() * 2);
        const winnerIndex = (loserIndex + 1) % 2;

        return { loserIndex, winnerIndex };
    }

    private updateFightResult(room: RoomGame, winner: Player, loser: Player): void {
        const fight = room.game.fight;

        fight.result.winner = winner.playerInfo.userName;
        fight.result.loser = loser.playerInfo.userName;
        fight.isFinished = true;

        winner.playerInGame.winCount++;
    }

    private isCurrentFighterAI(room: RoomGame, playerName: string): boolean {
        if (!room.game.fight) {
            return false;
        }
        return (
            !this.fightService.isCurrentFighter(room.game.fight, playerName) && room.game.fight.fighters.some((fighter) => !isPlayerHuman(fighter))
        );
    }
    private setRespawnPosition(room: RoomGame, loser: Player): void {
        room.game.fight.result.respawnPosition = this.fightService.setDefeatedPosition(
            loser.playerInGame.startPosition,
            room,
            loser.playerInfo.userName,
        );
    }

    private notifyHumanFighters<T>(room: RoomGame, event: GameEvents, result: T): void {
        room.game.fight.fighters.forEach((fighter) => {
            if (!isPlayerHuman(fighter)) {
                return;
            }
            const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, fighter.playerInfo.userName, Gateway.Fight);
            if (socket) {
                socket.emit(event, result);
            }
        });
    }

    private notifyFightersOfEscape(room: RoomGame, escapeResult: boolean): void {
        this.notifyHumanFighters(room, GameEvents.FighterEvade, escapeResult);
    }

    private notifyFightersOfAttack(room: RoomGame, attackResult: AttackResult): void {
        this.notifyHumanFighters(room, GameEvents.FighterAttack, attackResult);
    }
}
