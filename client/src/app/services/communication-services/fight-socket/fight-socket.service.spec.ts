import { TestBed } from '@angular/core/testing';

import { MOCK_ATTACK_RESULT, MOCK_FIGHT_RESULT, MOCK_PLAYERS } from '@app/constants/tests.constants';
import { FightState } from '@app/interfaces/fight-info';
import { GameLogicSocketService } from '@app/services/communication-services/game-logic-socket/game-logic-socket.service';
import { SocketService } from '@app/services/communication-services/socket/socket.service';
import { FightStateService } from '@app/services/states/fight-state/fight-state.service';
import { MyPlayerService } from '@app/services/states/my-player/my-player.service';
import { PlayerListService } from '@app/services/states/player-list/player-list.service';
import { RenderingStateService } from '@app/services/states/rendering-state/rendering-state.service';
import { Gateway } from '@common/enums/gateway.enum';
import { GameEvents } from '@common/enums/sockets-events/game.events';
import { of } from 'rxjs';
import { FightSocketService } from './fight-socket.service';

describe('FightSocketService', () => {
    let service: FightSocketService;
    let socketSpy: jasmine.SpyObj<SocketService>;
    let playerListSpy: jasmine.SpyObj<PlayerListService>;
    let fightStateSpy: jasmine.SpyObj<FightStateService>;
    let myPlayerSpy: jasmine.SpyObj<MyPlayerService>;
    let gameLogicSocketService: jasmine.SpyObj<GameLogicSocketService>;
    let rendererStateSpy: jasmine.SpyObj<RenderingStateService>;

    beforeEach(() => {
        socketSpy = jasmine.createSpyObj('SocketService', ['emit', 'on']);
        playerListSpy = jasmine.createSpyObj('PlayerListService', ['getCurrentPlayer']);
        fightStateSpy = jasmine.createSpyObj('FightStateService', [
            'initializeFight',
            'initializeFightTurn',
            'processAttack',
            'processEvasion',
            'processEndFight',
            'isAIInFight',
        ]);
        myPlayerSpy = jasmine.createSpyObj('MyPlayerService', ['getUserName'], {});

        rendererStateSpy = jasmine.createSpyObj('RenderingStateService', ['isInFightTransition']);

        const gameLogicSocketSpy = jasmine.createSpyObj('GameLogicSocketService', ['endAction']);

        TestBed.configureTestingModule({
            providers: [
                FightSocketService,
                { provide: SocketService, useValue: socketSpy },
                { provide: PlayerListService, useValue: playerListSpy },
                { provide: FightStateService, useValue: fightStateSpy },
                { provide: MyPlayerService, useValue: myPlayerSpy },
                { provide: GameLogicSocketService, useValue: gameLogicSocketSpy },
                { provide: RenderingStateService, useValue: rendererStateSpy },
            ],
        });
        service = TestBed.inject(FightSocketService);
        gameLogicSocketService = TestBed.inject(GameLogicSocketService) as jasmine.SpyObj<GameLogicSocketService>;
        socketSpy = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call emit on socketService when sendDesiredFight is called', () => {
        service.sendDesiredFight(MOCK_PLAYERS[0].playerInGame.currentPosition);
        expect(socketSpy.emit).toHaveBeenCalledWith(Gateway.Fight, GameEvents.DesireFight, MOCK_PLAYERS[0].playerInGame.currentPosition);
    });

    it('should call emit on socketService when sendDesiredAttack is called', () => {
        service.sendDesiredAttack();
        expect(socketSpy.emit).toHaveBeenCalledWith(Gateway.Fight, GameEvents.DesireAttack);
    });

    it('should call emit on socketService when sendDesiredEvade is called', () => {
        service.sendDesiredEvade();
        expect(socketSpy.emit).toHaveBeenCalledWith(Gateway.Fight, GameEvents.DesireEvade);
    });

    it('should call emit on socketService when endFightAction is called', () => {
        service.endFightAction();
        expect(socketSpy.emit).toHaveBeenCalledWith(Gateway.Fight, GameEvents.EndFightAction);
    });

    it('should decrement remaining actions of current player when fight starts', () => {
        const fightOrder = [MOCK_PLAYERS[0].playerInfo.userName, MOCK_PLAYERS[1].playerInfo.userName];
        const mockCurrentPlayer = JSON.parse(JSON.stringify(MOCK_PLAYERS[0]));
        socketSpy.on.and.returnValue(of(fightOrder));
        playerListSpy.getCurrentPlayer.and.returnValue(mockCurrentPlayer);
        service.initialize();
        expect(mockCurrentPlayer.playerInGame.remainingActions).toBe(0);
        expect(fightStateSpy.initializeFight).toHaveBeenCalledWith(fightOrder);
    });

    it('should set isFighting to false when current player is not in fight order', () => {
        const currentUserName = MOCK_PLAYERS[2].playerInfo.userName;
        const fightOrder = [MOCK_PLAYERS[0].playerInfo.userName, MOCK_PLAYERS[1].playerInfo.userName];
        socketSpy.on.and.returnValue(of(fightOrder));
        myPlayerSpy.getUserName.and.returnValue(currentUserName);
        service.initialize();
        expect(myPlayerSpy.isFighting).toBeFalse();
    });

    it('should set isFighting to true when the player is in the fight order', () => {
        const fightOrder = [MOCK_PLAYERS[0].playerInfo.userName, MOCK_PLAYERS[1].playerInfo.userName];
        const currentUserName = MOCK_PLAYERS[0].playerInfo.userName;

        socketSpy.on.and.returnValue(of(fightOrder));
        playerListSpy.getCurrentPlayer.and.returnValue(JSON.parse(JSON.stringify(MOCK_PLAYERS[0])));
        myPlayerSpy.getUserName.and.returnValue(currentUserName);

        const subscription = service['listenToStartFight']();

        expect(myPlayerSpy.isFighting).toBeTrue();
        expect(myPlayerSpy.isCurrentFighter).toBeTrue();
        expect(fightStateSpy.initializeFight).toHaveBeenCalledWith(fightOrder);
        expect(rendererStateSpy.isInFightTransition).toBeTrue();

        subscription.unsubscribe();
    });

    it('should call endAction when current player ends the fight', () => {
        const fightResult = MOCK_FIGHT_RESULT;

        myPlayerSpy.isCurrentPlayer = true;

        socketSpy.on.and.returnValue(of(fightResult));

        service['listenToEndFight']();
        expect(fightStateSpy.processEndFight).toHaveBeenCalledWith(fightResult);
        expect(myPlayerSpy.isCurrentFighter).toBeFalse();
        expect(myPlayerSpy.isFighting).toBeFalse();
        expect(gameLogicSocketService.endAction).toHaveBeenCalled();
    });

    it('should call emit on socketService when sendDesiredFightTimer is called', () => {
        service.sendDesiredFightTimer();
        expect(socketSpy.emit).toHaveBeenCalledWith(Gateway.Fight, GameEvents.DesiredFightTimer);
    });

    it('should process attack and update fight state when attack result is received', () => {
        fightStateSpy.fightState = FightState.Attack;
        spyOn(service, 'endFightAction');
        gameLogicSocketService.endAction.calls.reset();

        fightStateSpy.processAttack.and.returnValue();
        fightStateSpy.attackResult = { ...MOCK_ATTACK_RESULT };
        myPlayerSpy.isCurrentFighter = true;
        fightStateSpy.isAIInFight.and.returnValue(false);

        socketSpy.on.and.returnValue(of(JSON.parse(JSON.stringify(MOCK_ATTACK_RESULT))));

        const subscription = service['listenToAttack']();

        expect(fightStateSpy.processAttack).toHaveBeenCalledWith(JSON.parse(JSON.stringify(MOCK_ATTACK_RESULT)));

        fightStateSpy.attackResult!.hasDealtDamage = true;
        service['listenToAttack']();
        expect(fightStateSpy.fightState).toBe(FightState.Attack);

        fightStateSpy.attackResult!.hasDealtDamage = false;
        fightStateSpy.isAIInFight.and.returnValue(true);
        service['listenToAttack']();
        expect(service.endFightAction).toHaveBeenCalled();

        subscription.unsubscribe();
    });

    it('should process evade and update fight state when evade result is received', () => {
        let evasionSuccessful = true;
        spyOn(service, 'endFightAction');

        gameLogicSocketService.endAction.calls.reset();
        fightStateSpy.processEvasion.calls.reset();

        fightStateSpy.isAIInFight.and.returnValue(false);
        myPlayerSpy.isCurrentFighter = true;

        socketSpy.on.and.returnValue(of(evasionSuccessful));

        const subscription = service['listenToEvade']();

        expect(fightStateSpy.processEvasion).toHaveBeenCalledWith(evasionSuccessful);

        expect(fightStateSpy.fightState).toBe(FightState.Evade);

        evasionSuccessful = false;
        socketSpy.on.and.returnValue(of(evasionSuccessful));
        service['listenToEvade']();
        expect(service.endFightAction).toHaveBeenCalled();

        evasionSuccessful = false;
        myPlayerSpy.isCurrentFighter = false;
        socketSpy.on.and.returnValue(of(evasionSuccessful));
        fightStateSpy.isAIInFight.and.returnValue(true);
        service['listenToEvade']();
        expect(service.endFightAction).toHaveBeenCalled();

        subscription.unsubscribe();
    });
});
