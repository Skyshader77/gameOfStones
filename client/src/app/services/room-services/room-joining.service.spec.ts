import { TestBed } from '@angular/core/testing';
import { RoomJoiningService } from './room-joining.service';
import { RoomAPIService } from '@app/services/api-services/room-api.service';
import { RoomSocketService } from '@app/services/communication-services/room-socket.service';
import { RoomStateService } from './room-state.service';
import { of } from 'rxjs';
import { MOCK_PLAYERS } from '@app/constants/tests.constants';

describe('RoomJoiningService', () => {
    let service: RoomJoiningService;
    let roomAPIServiceSpy: jasmine.SpyObj<RoomAPIService>;
    let roomSocketServiceSpy: jasmine.SpyObj<RoomSocketService>;
    let roomStateService: RoomStateService;

    beforeEach(() => {
        roomAPIServiceSpy = jasmine.createSpyObj('RoomAPIService', ['checkRoomExists']);
        roomSocketServiceSpy = jasmine.createSpyObj('RoomSocketService', ['requestJoinRoom', 'handlePlayerCreationOpened']);

        TestBed.configureTestingModule({
            providers: [
                RoomJoiningService,
                RoomStateService,
                { provide: RoomAPIService, useValue: roomAPIServiceSpy },
                { provide: RoomSocketService, useValue: roomSocketServiceSpy },
            ],
        });

        service = TestBed.inject(RoomJoiningService);
        roomStateService = TestBed.inject(RoomStateService); // Get the actual instance
        service.playerToJoin = MOCK_PLAYERS[0];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get roomCode from RoomStateService', () => {
        roomStateService.roomCode = '1234';
        expect(service.roomCode).toBe('1234');
    });

    it('should set roomCode in RoomStateService', () => {
        service.roomCode = '5678';
        expect(roomStateService.roomCode).toBe('5678');
    });

    it('should validate input as a 4-digit number', () => {
        expect(service.isValidInput('1234')).toBeTrue();
        expect(service.isValidInput('abcd')).toBeFalse();
        expect(service.isValidInput('123')).toBeFalse();
        expect(service.isValidInput('12345')).toBeFalse();
    });

    it('should check if a room exists by calling RoomAPIService', (done) => {
        roomAPIServiceSpy.checkRoomExists.and.returnValue(of(true));

        service.doesRoomExist('1234').subscribe((exists) => {
            expect(exists).toBeTrue();
            expect(roomAPIServiceSpy.checkRoomExists).toHaveBeenCalledWith('1234');
            done();
        });
    });

    it('should request to join a room through RoomSocketService', () => {
        service.requestJoinRoom('1234');
        expect(roomSocketServiceSpy.requestJoinRoom).toHaveBeenCalledWith('1234', MOCK_PLAYERS[0]);
    });

    it('should notify RoomSocketService when player creation is opened', () => {
        service.handlePlayerCreationOpened('1234');
        expect(roomSocketServiceSpy.handlePlayerCreationOpened).toHaveBeenCalledWith('1234');
    });
});
