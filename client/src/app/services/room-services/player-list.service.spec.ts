import { TestBed } from '@angular/core/testing';

import { MOCK_PLAYER, MOCK_PLAYER_DATA } from '@app/constants/tests.constants';
import { SocketService } from '@app/services/communication-services/socket.service';
import { of } from 'rxjs';
import { PlayerListService } from './player-list.service';
import { MyPlayerService } from './my-player.service';
import { Router } from '@angular/router';
import { RoomEvents } from '@common/interfaces/sockets.events/room.events';
import { Gateway } from '@common/constants/gateway.constants';

describe('PlayerListService', () => {
    let service: PlayerListService;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let myPlayerServiceSpy: jasmine.SpyObj<MyPlayerService>;
    let router: Router;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['on', 'emit']);
        socketServiceSpy.on.and.returnValue(of([MOCK_PLAYER]));

        TestBed.configureTestingModule({
            providers: [
                PlayerListService,
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: MyPlayerService, useValue: myPlayerServiceSpy },
                { provide: Router, useValue: router },
            ],
        });

        service = TestBed.inject(PlayerListService);
        socketServiceSpy = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // it('should update playerList when receiving player list updates from the socket', () => {});

    it('should emit DesireKickPlayer event when removePlayer is called', () => {
        const playerNameToRemove = 'Player 1';
        service.removePlayer(playerNameToRemove);

        expect(socketServiceSpy.emit).toHaveBeenCalledWith(Gateway.ROOM, RoomEvents.DesireKickPlayer, playerNameToRemove);
    });

    it('should not throw an error when removing a non-existing player', () => {
        service.playerList = [...MOCK_PLAYER_DATA];
        const playerIdToRemove = 'nonExistingId';
        const expectedListLength = 3;

        expect(() => service.removePlayer(playerIdToRemove)).not.toThrow();
        expect(service.playerList.length).toBe(expectedListLength);
    });
});
