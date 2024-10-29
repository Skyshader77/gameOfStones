import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ROOM_CREATION_STATUS } from '@app/constants/room.constants';
import { MOCK_MAPS, MOCK_PLAYERS, MOCK_ROOM } from '@app/constants/tests.constants';
import { MapAPIService } from '@app/services/api-services/map-api.service';
import { RoomAPIService } from '@app/services/api-services/room-api.service';
import { SocketService } from '@app/services/communication-services/socket.service';
import { MapSelectionService } from '@app/services/map-list-managing-services/map-selection.service';
import { ModalMessageService } from '@app/services/utilitary/modal-message.service';
import { of, throwError } from 'rxjs';
import { RoomCreationService } from './room-creation.service';
import { RoomSocketService } from '@app/services/communication-services/room-socket.service';
import { Map } from '@common/interfaces/map';

describe('RoomCreationService', () => {
    let service: RoomCreationService;
    let mapAPISpy: jasmine.SpyObj<MapAPIService>;
    let roomAPISpy: jasmine.SpyObj<RoomAPIService>;
    let mapSelectionSpy: jasmine.SpyObj<MapSelectionService>;
    let modalMessageSpy: jasmine.SpyObj<ModalMessageService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let roomSocketServiceSpy: jasmine.SpyObj<RoomSocketService>;
    const mockMap: Map = MOCK_MAPS[1];
    const invisibleMockMap: Map = MOCK_MAPS[0];

    beforeEach(() => {
        mapAPISpy = jasmine.createSpyObj('MapAPIService', ['getMapById']);
        roomAPISpy = jasmine.createSpyObj('RoomAPIService', ['createRoom']);
        mapSelectionSpy = jasmine.createSpyObj('MapSelectionService', ['initialize', 'selectedMap'], {
            selectedMap: null,
        });
        modalMessageSpy = jasmine.createSpyObj('ModalMessageService', ['showMessage']);
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['joinRoom', 'createRoom', 'getSockets']);
        roomSocketServiceSpy = jasmine.createSpyObj('RoomSocketService', ['joinRoom', 'createRoom', 'leaveRoom']);

        TestBed.configureTestingModule({
            providers: [
                { provide: MapAPIService, useValue: mapAPISpy },
                { provide: RoomAPIService, useValue: roomAPISpy },
                { provide: MapSelectionService, useValue: mapSelectionSpy },
                { provide: ModalMessageService, useValue: modalMessageSpy },
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: RoomSocketService, useValue: roomSocketServiceSpy },
                provideHttpClientTesting(),
            ],
        });
        service = TestBed.inject(RoomCreationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should initialize mapSelectionService on initialization', () => {
        service.initialize();

        expect(mapSelectionSpy.initialize).toHaveBeenCalled();
    });

    it('should need to have selected a map for the selection to be valid', () => {
        service.isSelectionValid().subscribe((isValid: boolean) => {
            expect(isValid).toBeFalse();
            expect(modalMessageSpy.showMessage).toHaveBeenCalledWith({ title: ROOM_CREATION_STATUS.noSelection, content: jasmine.anything() });
        });
    });

    it('should create and join a room when handleRoomCreation is called', () => {
        service.handleRoomCreation(MOCK_PLAYERS[0], MOCK_ROOM.roomCode, mockMap);

        expect(roomSocketServiceSpy.createRoom).toHaveBeenCalledWith(MOCK_ROOM.roomCode, mockMap);
        expect(roomSocketServiceSpy.joinRoom).toHaveBeenCalledWith(MOCK_ROOM.roomCode, MOCK_PLAYERS[0]);
    });

    it('should be valid to have the selected map in the list ', () => {
        Object.defineProperty(mapSelectionSpy, 'selectedMap', {
            get: () => mockMap,
        });
        mapAPISpy.getMapById.and.returnValue(of(mockMap));
        service.isSelectionValid().subscribe((isValid: boolean) => {
            expect(isValid).toBeTrue();
        });
    });

    it('should not be valid for the selected map to no longer be in the list ', () => {
        Object.defineProperty(mapSelectionSpy, 'selectedMap', {
            get: () => mockMap,
        });
        mapAPISpy.getMapById.and.returnValue(throwError(() => new Error('No map matches this id!')));
        service.isSelectionValid().subscribe((isValid: boolean) => {
            expect(isValid).toBeFalse();
            expect(modalMessageSpy.showMessage).toHaveBeenCalledWith({ title: ROOM_CREATION_STATUS.noLongerExists, content: jasmine.anything() });
        });
    });

    it('should not be valid for the selected map to be invisible ', () => {
        Object.defineProperty(mapSelectionSpy, 'selectedMap', {
            get: () => invisibleMockMap,
        });
        mapAPISpy.getMapById.and.returnValue(of(invisibleMockMap));
        service.isSelectionValid().subscribe((isValid: boolean) => {
            expect(isValid).toBeFalse();
            expect(modalMessageSpy.showMessage).toHaveBeenCalledWith({ title: ROOM_CREATION_STATUS.isNotVisible, content: jasmine.anything() });
        });
    });

    it('isMapSelected should be true when there is a selection', () => {
        Object.defineProperty(mapSelectionSpy, 'selectedMap', {
            get: () => mockMap,
        });
        expect(service.isMapSelected()).toBeTrue();
    });

    it('should not create a room for an invalid map ', () => {
        spyOn(service, 'isSelectionValid').and.returnValue(of(false));
        service.submitCreation().subscribe(({ room, selectedMap }) => {
            expect(room).toBeNull();
            expect(selectedMap).toBeNull();
            expect(roomAPISpy.createRoom).not.toHaveBeenCalled();
        });
    });

    it('should create a room for a valid map ', () => {
        spyOn(service, 'isSelectionValid').and.returnValue(of(true));

        Object.defineProperty(mapSelectionSpy, 'selectedMap', {
            get: () => mockMap,
            configurable: true,
        });

        roomAPISpy.createRoom.and.returnValue(of(MOCK_ROOM));
        service.submitCreation().subscribe(({ room, selectedMap }) => {
            expect(roomAPISpy.createRoom).toHaveBeenCalled();
            expect(room).toEqual(MOCK_ROOM);
            expect(selectedMap).not.toBeNull();
        });
    });
});
