import { TIMER_RESOLUTION_MS } from '@app/constants/time.constants';
import { MAX_AI_FIGHT_ACTION_DELAY, MIN_AI_FIGHT_ACTION_DELAY } from '@app/constants/virtual-player.constants';
import { MessagingGateway } from '@app/gateways/messaging/messaging.gateway';
import { ItemLostHandler } from '@app/interfaces/item';
import { RoomGame } from '@app/interfaces/room-game';
import { GameTimeService } from '@app/services/game-time/game-time.service';
import { ItemManagerService } from '@app/services/item-manager/item-manager.service';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { SocketManagerService } from '@app/services/socket-manager/socket-manager.service';
import { isPlayerHuman } from '@app/utils/utilities';
import { GameStatus } from '@common/enums/game-status.enum';
import { Gateway } from '@common/enums/gateway.enum';
import { JournalEntry } from '@common/enums/journal-entry.enum';
import { PlayerRole } from '@common/enums/player-role.enum';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { Player } from '@common/interfaces/player';
import { Vec2 } from '@common/interfaces/vec2';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { FightLogicService } from './fight-logic.service';

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

    @Inject(RoomManagerService)
    private roomManagerService: RoomManagerService;

    private readonly logger = new Logger(FightManagerService.name);

    startFight(room: RoomGame, opponentName: string) {
        if (this.fightService.isFightValid(room, opponentName)) {
            const server = this.socketManagerService.getGatewayServer(Gateway.Fight);
            this.fightService.initializeFight(room, opponentName);
            const fightOrder = room.game.fight.fighters.map((fighter) => fighter.playerInfo.userName);
            server.to(room.room.roomCode).emit(GameEvents.StartFight, fightOrder);
            this.gameTimeService.stopTimer(room.game.timer);
            room.game.status = GameStatus.Fight;
            this.messagingGateway.sendPublicJournal(room, JournalEntry.FightStart);
            room.game.fight.timer = this.gameTimeService.getInitialTimer();
            this.startFightTurn(room);
            room.game.fight.timer.timerSubscription = this.gameTimeService.getTimerSubject(room.game.fight.timer).subscribe((counter: number) => {
                this.remainingFightTime(room, counter);
            });
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
        console.log('next fighter name : ' + nextFighterName);
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

    startVirtualPlayerFightTurn(room: RoomGame, fighter: Player) {
        const fighterIndex = room.game.fight.currentFighter;

        const randomInterval = Math.floor(Math.random() * (MAX_AI_FIGHT_ACTION_DELAY - MIN_AI_FIGHT_ACTION_DELAY + 1)) + MIN_AI_FIGHT_ACTION_DELAY;
        setTimeout(() => {
            room.game.fight.hasPendingAction = true;
            if (fighter.playerInfo.role === PlayerRole.AggressiveAI || !room.game.fight.numbEvasionsLeft[fighterIndex]) {
                this.fighterAttack(room);
            } else this.fighterEscape(room);
        }, randomInterval);
    }

    fighterAttack(room: RoomGame) {
        this.messagingGateway.sendPrivateJournal(
            room,
            room.game.fight.fighters.map((fighter) => fighter.playerInfo.userName),
            JournalEntry.FightAttack,
        );
        const attackResult = this.fightService.attack(room);
        this.gameTimeService.getInitialTimer();
        this.messagingGateway.sendAttackResultJournal(room, attackResult);
        room.game.fight.fighters.forEach((fighter) => {
            if (isPlayerHuman(fighter)) {
                const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, fighter.playerInfo.userName, Gateway.Fight);
                if (socket) {
                    socket.emit(GameEvents.FighterAttack, attackResult);
                }
            } else if (this.areTwoAIsFighting(room)) this.handleEndFightAction(room, fighter.playerInfo.userName);
        });
    }

    fighterEscape(room: RoomGame) {
        this.messagingGateway.sendPrivateJournal(
            room,
            room.game.fight.fighters.map((fighter) => fighter.playerInfo.userName),
            JournalEntry.FightEvade,
        );
        const evasionSuccessful = this.fightService.escape(room);
        room.game.fight.fighters.forEach((fighter) => {
            const socket = this.socketManagerService.getPlayerSocket(room.room.roomCode, fighter.playerInfo.userName, Gateway.Fight);
            if (socket) {
                socket.emit(GameEvents.FighterEvade, evasionSuccessful);
            }
        });
        this.messagingGateway.sendEvasionResultJournal(room, evasionSuccessful);
    }

    fightEnd(room: RoomGame) {
        const server = this.socketManagerService.getGatewayServer(Gateway.Fight);
        this.fightService.endFight(room);
        this.gameTimeService.stopTimer(room.game.fight.timer);
        room.game.fight.timer.timerSubscription.unsubscribe();
        this.messagingGateway.sendPublicJournal(room, JournalEntry.FightEnd);
        console.log('fight end');
        server.to(room.room.roomCode).emit(GameEvents.FightEnd, room.game.fight.result);
    }

    handleEndFightAction(room: RoomGame, playerName: string) {
        const fight = room.game.fight;

        if (this.fightService.isCurrentFighter(fight, playerName) || this.isCurrentFighterAI(room, playerName)) {
            if (fight.isFinished) {
                const loserPlayer = room.players.find((player) => player.playerInfo.userName === fight.result.loser);

                if (loserPlayer) {
                    loserPlayer.playerInGame.currentPosition = {
                        x: fight.result.respawnPosition.x,
                        y: fight.result.respawnPosition.y,
                    };

                    const loserPositions: Vec2 = JSON.parse(
                        JSON.stringify({ x: loserPlayer.playerInGame.currentPosition.x, y: loserPlayer.playerInGame.currentPosition.y }),
                    );
                    loserPlayer.playerInGame.inventory.forEach((item) => {
                        const itemLostHandler: ItemLostHandler = {
                            room,
                            playerName: loserPlayer.playerInfo.userName,
                            itemDropPosition: loserPositions,
                            itemType: item,
                        };
                        this.itemManagerService.handleItemLost(itemLostHandler);
                    });
                }
                console.log('handle fight end');
                this.fightEnd(room);
                fight.fighters.forEach((fighter) => {
                    fighter.playerInGame.remainingHp = fighter.playerInGame.attributes.hp;
                });
            } else {
                this.startFightTurn(room);
            }
        }
    }

    remainingFightTime(room: RoomGame, count: number) {
        if (room.game.fight?.fighters === null) {
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
            room.game.fight.isFinished = true;
            room.game.fight.result.winner = winningPlayer.playerInfo.userName;
            room.game.fight.result.loser = abandonedFighterName;
        }
    }

    isInFight(room: RoomGame, abandonedFighterName: string): boolean {
        if (!room.game.fight) {
            return false;
        }
        return room.game.fight.fighters.some((fighter) => fighter.playerInfo.userName === abandonedFighterName);
    }

    areTwoAIsFighting(room: RoomGame): boolean {
        if (!room.game.fight) {
            return false;
        }
        return !room.game.fight.fighters.some((fighter) => isPlayerHuman(fighter));
    }

    isCurrentFighterAI(room: RoomGame, playerName: string): boolean {
        if (!room.game.fight) {
            return false;
        }
        return (
            !this.fightService.isCurrentFighter(room.game.fight, playerName) && room.game.fight.fighters.some((fighter) => !isPlayerHuman(fighter))
        );
    }
}
