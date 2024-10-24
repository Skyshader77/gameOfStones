import { TestBed } from '@angular/core/testing';

import { RoomEvents, SocketRole } from '@app/constants/socket.constants';
import { MOCK_PLAYER, MOCK_PLAYER_DATA, MOCK_ROOM } from '@app/constants/tests.constants';
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

    it('should emit FETCH_PLAYERS event with the correct room ID when fetchPlayers is called', () => {
        service.fetchPlayers(MOCK_ROOM.roomCode);

        expect(socketServiceSpy.emit).toHaveBeenCalledWith(SocketRole.ROOM, RoomEvents.FETCH_PLAYERS, { roomId: MOCK_ROOM.roomCode });
    });

    it('should remove a player from playerList when removePlayer is called', () => {
        service.playerList = [...MOCK_PLAYER_DATA];
        const playerNameToRemove = 'Player 1';
        const expectedListLength = 2;

        service.removePlayer(playerNameToRemove);

        expect(service.playerList.length).toBe(expectedListLength);
        expect(service.playerList.some((player) => player.id === playerNameToRemove)).toBe(false);
        expect(service.playerList[0].id).toBe('2');
    });

    it('should not throw an error when removing a non-existing player', () => {
        service.playerList = [...MOCK_PLAYER_DATA];
        const playerIdToRemove = 'nonExistingId';
        const expectedListLength = 3;

        expect(() => service.removePlayer(playerIdToRemove)).not.toThrow();
        expect(service.playerList.length).toBe(expectedListLength);
    });
});
