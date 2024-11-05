import { TestBed } from '@angular/core/testing';

import { MOCK_PLAYERS } from '@app/constants/tests.constants';
import { FightStateService } from '@app/services/room-services/fight-state.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';
import { PlayerListService } from '@app/services/room-services/player-list.service';
import { Gateway } from '@common/enums/gateway.enum';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { of } from 'rxjs';
import { FightSocketService } from './fight-socket.service';
import { SocketService } from './socket.service';

describe('FightSocketService', () => {
    let service: FightSocketService;
    let socketService: jasmine.SpyObj<SocketService>;
    let playerListService: jasmine.SpyObj<PlayerListService>;
    let fightStateService: jasmine.SpyObj<FightStateService>;
    let myPlayerService: jasmine.SpyObj<MyPlayerService>;

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

        TestBed.configureTestingModule({
            providers: [
                FightSocketService,
                { provide: SocketService, useValue: socketSpy },
                { provide: PlayerListService, useValue: playerListSpy },
                { provide: FightStateService, useValue: fightStateSpy },
                { provide: MyPlayerService, useValue: myPlayerSpy },
            ],
        });
        service = TestBed.inject(FightSocketService);
        socketService = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
        playerListService = TestBed.inject(PlayerListService) as jasmine.SpyObj<PlayerListService>;
        fightStateService = TestBed.inject(FightStateService) as jasmine.SpyObj<FightStateService>;
        myPlayerService = TestBed.inject(MyPlayerService) as jasmine.SpyObj<MyPlayerService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call emit on socketService when sendDesiredFight is called', () => {
        service.sendDesiredFight(MOCK_PLAYERS[0].playerInfo.userName);
        expect(socketService.emit).toHaveBeenCalledWith(Gateway.GAME, GameEvents.DesiredFight, MOCK_PLAYERS[0].playerInfo.userName);
    });

    it('should call emit on socketService when sendDesiredAttack is called', () => {
        service.sendDesiredAttack();
        expect(socketService.emit).toHaveBeenCalledWith(Gateway.GAME, GameEvents.DesiredAttack);
    });

    it('should call emit on socketService when sendDesiredEvade is called', () => {
        service.sendDesiredEvade();
        expect(socketService.emit).toHaveBeenCalledWith(Gateway.GAME, GameEvents.DesiredEvade);
    });

    it('should call emit on socketService when endFightAction is called', () => {
        service.endFightAction();
        expect(socketService.emit).toHaveBeenCalledWith(Gateway.GAME, GameEvents.EndFightAction);
    });

    it('should decrement remaining actions of current player when fight starts', () => {
        const fightOrder = [MOCK_PLAYERS[0].playerInfo.userName, MOCK_PLAYERS[1].playerInfo.userName];
        const mockCurrentPlayer = MOCK_PLAYERS[0];
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
});
