import { TIMER_RESOLUTION_MS } from '@app/constants/time.constants';
import { RoomGame } from '@app/interfaces/room-game';
import { Gateway } from '@common/constants/gateway.constants';
import { GameStatus } from '@common/enums/game-status.enum';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { Inject, Injectable } from '@nestjs/common';
import { FightLogicService } from './fight.logic.service';
import { Server } from 'socket.io';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';

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

    startFight(room: RoomGame, opponentName: string, server: Server) {
        if (this.fightService.isFightValid(room, opponentName)) {
            this.fightService.initializeFight(room, opponentName);
            const fightOrder = room.game.fight.fighters.map((fighter) => fighter.playerInfo.userName);
            server.to(room.room.roomCode).emit(GameEvents.StartFight, fightOrder);
            this.gameTimeService.stopTimer(room.game.timer);
            room.game.status = GameStatus.Fight;
            this.messagingGateway.sendPublicJournal(room, JournalEntry.FightStart);
            room.game.fight.timer = this.gameTimeService.getInitialTimer();
            room.game.fight.timer.timerSubscription = this.gameTimeService.getTimerSubject(room.game.fight.timer).subscribe((counter: number) => {
                this.remainingFightTime(room, counter);
            });
            this.startFightTurn(room);
        }
    }

    startFightTurn(room: RoomGame) {
        const nextFighterName = this.fightService.nextFightTurn(room.game.fight);
        const turnTime = this.fightService.getTurnTime(room.game.fight);
        room.game.fight.fighters.forEach((fighter) => {
            const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, fighter.playerInfo.userName, Gateway.GAME);
            if (socket) {
                socket.emit(GameEvents.StartFightTurn, { currentFighter: nextFighterName, time: turnTime });
            }
        });
        this.gameTimeService.startTimer(room.game.fight.timer, turnTime);
    }

    fighterAttack(room: RoomGame) {
        this.messagingGateway.sendPrivateJournal(
            room,
            room.game.fight.fighters.map((fighter) => fighter.playerInfo.userName),
            JournalEntry.FightAttack,
        );
        const attackResult = this.fightService.attack(room.game.fight);
        room.game.fight.fighters.forEach((fighter) => {
            const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, fighter.playerInfo.userName, Gateway.GAME);
            if (socket) {
                socket.emit(GameEvents.FighterAttack, attackResult);
            }
        });
    }

    fighterEvade(room: RoomGame) {
        this.messagingGateway.sendPrivateJournal(
            room,
            room.game.fight.fighters.map((fighter) => fighter.playerInfo.userName),
            JournalEntry.FightEvade,
        );
        const evasionSuccessful = this.fightService.evade(room.game.fight);
        room.game.fight.fighters.forEach((fighter) => {
            const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, fighter.playerInfo.userName, Gateway.GAME);
            if (socket) {
                socket.emit(GameEvents.FighterEvade, evasionSuccessful);
            }
        });
    }

    fightEnd(room: RoomGame, server: Server) {
        this.messagingGateway.sendPublicJournal(room, JournalEntry.FightEnd);
        this.gameTimeService.stopTimer(room.game.fight.timer);
        room.game.fight.timer.timerSubscription.unsubscribe();
        server.to(room.room.roomCode).emit(GameEvents.FightEnd, room.game.fight.result);
    }

    remainingFightTime(room: RoomGame, count: number) {
        room.game.fight.fighters.forEach((fighter) => {
            const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, fighter.playerInfo.userName, Gateway.GAME);
            if (socket) {
                socket.emit(GameEvents.RemainingTime, count);
            }
        });

        if (room.game.fight.timer.counter === 0) {
            setTimeout(() => {
                if (!room.game.fight.hasPendingAction) {
                    this.fighterAttack(room);
                }
            }, TIMER_RESOLUTION_MS);
        }
    }
}
