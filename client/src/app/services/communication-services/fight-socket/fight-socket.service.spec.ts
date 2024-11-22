import { TestBed } from '@angular/core/testing';

import { MOCK_FIGHT_RESULT, MOCK_PLAYERS } from '@app/constants/tests.constants';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { Gateway } from '@common/enums/gateway.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { of } from 'rxjs';
import { FightSocketService } from './fight-socket.service';
import { SocketService } from '@app/services/communication-services/socket/socket.service';
import { FightStateService } from '@app/services/states/fight-state/fight-state.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket/game-logic-socket.service';

describe('FightSocketService', () => {
    let service: FightSocketService;
    let socketService: jasmine.SpyObj<SocketService>;
    let playerListService: jasmine.SpyObj<PlayerListService>;
    let fightStateService: jasmine.SpyObj<FightStateService>;
    let myPlayerService: jasmine.SpyObj<MyPlayerService>;
    let gameLogicSocketService: jasmine.SpyObj<GameLogicSocketService>;

    beforeEach(() => {
        const socketSpy = jasmine.createSpyObj('SocketService', ['emit', 'on']);
        const playerListSpy = jasmine.createSpyObj('PlayerListService', ['getCurrentPlayer']);
        const fightStateSpy = jasmine.createSpyObj('FightStateService', [
            'initializeFight',
            'initializeFightTurn',
            'processAttack',
            'processEvasion',
            'processEndFight',
        ]);
        const myPlayerSpy = jasmine.createSpyObj('MyPlayerService', ['getUserName'], {
            isFighting: false,
        });

        const gameLogicSocketSpy = jasmine.createSpyObj('GameLogicSocketService', ['endAction']);

        TestBed.configureTestingModule({
            providers: [
                FightSocketService,
                { provide: SocketService, useValue: socketSpy },
                { provide: PlayerListService, useValue: playerListSpy },
                { provide: FightStateService, useValue: fightStateSpy },
                { provide: MyPlayerService, useValue: myPlayerSpy },
                { provide: GameLogicSocketService, useValue: gameLogicSocketSpy },
            ],
        });
        service = TestBed.inject(FightSocketService);
        gameLogicSocketService = TestBed.inject(GameLogicSocketService) as jasmine.SpyObj<GameLogicSocketService>;
        socketService = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
        playerListService = TestBed.inject(PlayerListService) as jasmine.SpyObj<PlayerListService>;
        fightStateService = TestBed.inject(FightStateService) as jasmine.SpyObj<FightStateService>;
        myPlayerService = TestBed.inject(MyPlayerService) as jasmine.SpyObj<MyPlayerService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call emit on socketService when sendDesiredFight is called', () => {
        service.sendDesiredFight(MOCK_PLAYERS[0].playerInGame.currentPosition);
        expect(socketService.emit).toHaveBeenCalledWith(Gateway.Fight, GameEvents.DesireFight, MOCK_PLAYERS[0].playerInGame.currentPosition);
    });

    it('should call emit on socketService when sendDesiredAttack is called', () => {
        service.sendDesiredAttack();
        expect(socketService.emit).toHaveBeenCalledWith(Gateway.Fight, GameEvents.DesireAttack);
    });

    it('should call emit on socketService when sendDesiredEvade is called', () => {
        service.sendDesiredEvade();
        expect(socketService.emit).toHaveBeenCalledWith(Gateway.Fight, GameEvents.DesireEvade);
    });

    it('should call emit on socketService when endFightAction is called', () => {
        service.endFightAction();
        expect(socketService.emit).toHaveBeenCalledWith(Gateway.Fight, GameEvents.EndFightAction);
    });

    it('should decrement remaining actions of current player when fight starts', () => {
        const fightOrder = [MOCK_PLAYERS[0].playerInfo.userName, MOCK_PLAYERS[1].playerInfo.userName];
        const mockCurrentPlayer = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        socketService.on.and.returnValue(of(fightOrder));
        playerListService.getCurrentPlayer.and.returnValue(mockCurrentPlayer);
        service.initialize();
        expect(mockCurrentPlayer.playerInGame.remainingActions).toBe(0);
        expect(fightStateService.initializeFight).toHaveBeenCalledWith(fightOrder);
    });

    it('should set isFighting to false when current player is not in fight order', () => {
        const currentUserName = MOCK_PLAYERS[2].playerInfo.userName;
        const fightOrder = [MOCK_PLAYERS[0].playerInfo.userName, MOCK_PLAYERS[1].playerInfo.userName];
        socketService.on.and.returnValue(of(fightOrder));
        myPlayerService.getUserName.and.returnValue(currentUserName);
        service.initialize();
        expect(myPlayerService.isFighting).toBeFalse();
    });

    it('should call endAction when current player ends the fight', () => {
        const fightResult = MOCK_FIGHT_RESULT;

        myPlayerService.isCurrentPlayer = true;

        socketService.on.and.returnValue(of(fightResult));

        service['listenToEndFight']();
        expect(fightStateService.processEndFight).toHaveBeenCalledWith(fightResult);
        expect(myPlayerService.isCurrentFighter).toBeFalse();
        expect(myPlayerService.isFighting).toBeFalse();
        expect(gameLogicSocketService.endAction).toHaveBeenCalled();
    });
});
