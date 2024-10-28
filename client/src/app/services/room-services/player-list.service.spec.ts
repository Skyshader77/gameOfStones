import { TestBed } from '@angular/core/testing';

import { Gateway } from '@common/constants/gateway.constants';
import { RoomEvents } from '@common/interfaces/sockets.events/room.events';
import { MOCK_PLAYERS, MOCK_ROOM } from '@app/constants/tests.constants';
import { SocketService } from '@app/services/communication-services/socket.service';
import { of } from 'rxjs';
import { PlayerListService } from './player-list.service';
import { MyPlayerService } from './my-player.service';
import { Router } from '@angular/router';

describe('PlayerListService', () => {
    let service: PlayerListService;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let myPlayerServiceSpy: jasmine.SpyObj<MyPlayerService>;
    let router: Router;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['on', 'emit']);
        socketServiceSpy.on.and.returnValue(of([MOCK_PLAYERS[0]]));

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

    it('should emit FETCH_PLAYERS event with the correct room ID when fetchPlayers is called', () => {
        service.fetchPlayers(MOCK_ROOM.roomCode);

        expect(socketServiceSpy.emit).toHaveBeenCalledWith(Gateway.ROOM, RoomEvents.FETCH_PLAYERS, { roomId: MOCK_ROOM.roomCode });
    });

    it('should remove a player from playerList when removePlayer is called', () => {
        service.playerList = [...MOCK_PLAYERS];
        const playerNameToRemove = 'Player 1';
        const expectedListLength = 2;

        service.removePlayer(playerNameToRemove);

        expect(service.playerList.length).toBe(expectedListLength);
        expect(service.playerList.some((player) => player.playerInfo.id === playerNameToRemove)).toBe(false);
        expect(service.playerList[0].playerInfo.id).toBe('2');
    });

    it('should not throw an error when removing a non-existing player', () => {
        service.playerList = [...MOCK_PLAYERS];
        const playerIdToRemove = 'nonExistingId';
        const expectedListLength = 3;

        expect(() => service.removePlayer(playerIdToRemove)).not.toThrow();
        expect(service.playerList.length).toBe(expectedListLength);
    });
});
