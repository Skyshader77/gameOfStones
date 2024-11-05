import { TestBed } from '@angular/core/testing';

import { FightSocketService } from './fight-socket.service';
import { SocketService } from './socket.service';
import { Gateway } from '@common/constants/gateway.constants';
import { GameEvents } from '@common/enums/sockets.events/game.events';
import { MOCK_PLAYERS } from '@app/constants/tests.constants';
import { FightStateService } from '@app/services/room-services/fight-state.service';
import { MyPlayerService } from '@app/services/room-services/my-player.service';

describe('FightSocketService', () => {
    let service: FightSocketService;
    let socketService: jasmine.SpyObj<SocketService>;
    let fightStateService: jasmine.SpyObj<FightStateService>;
    let myPlayerService: jasmine.SpyObj<MyPlayerService>;

    beforeEach(() => {
        const socketSpy = jasmine.createSpyObj('SocketService', ['emit', 'on']);
        TestBed.configureTestingModule({
            providers: [
                FightSocketService,
                { provide: SocketService, useValue: socketSpy },
                { provide: FightStateService, useValue: fightStateService },
                { provide: myPlayerService, useValue: myPlayerService },
            ],
        });
        service = TestBed.inject(FightSocketService);
        socketService = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
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
});
