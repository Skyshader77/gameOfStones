import { TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Map } from '@app/interfaces/map';
import { of, throwError } from 'rxjs';
import { LobbyCreationService } from './lobby-creation.service';
import { MapAPIService } from './map-api.service';
import { MapSelectionService } from './map-selection.service';
import { RoomAPIService } from './room-api.service';

import { Room } from '@app/interfaces/room';
import { mockMaps, mockRoom } from '@app/constants/tests.constants';
import { LOBBY_CREATION_STATUS } from '@app/constants/lobby.constants';

describe('LobbyCreationService', () => {
    let service: LobbyCreationService;
    let mapAPISpy: jasmine.SpyObj<MapAPIService>;
    let roomAPISpy: jasmine.SpyObj<RoomAPIService>;
    let mapSelectionSpy: jasmine.SpyObj<MapSelectionService>;
    const mockMap: Map = mockMaps[1];
    const invisibleMockMap: Map = mockMaps[0];

    beforeEach(() => {
        mapAPISpy = jasmine.createSpyObj('MapAPIService', ['getMapById']);
        roomAPISpy = jasmine.createSpyObj('RoomAPIService', ['createRoom']);
        mapSelectionSpy = jasmine.createSpyObj('MapSelectionService', ['initialize', 'selectedMap'], {
            selectedMap: null,
        });
        TestBed.configureTestingModule({
            providers: [
                { provide: MapAPIService, useValue: mapAPISpy },
                { provide: RoomAPIService, useValue: roomAPISpy },
                { provide: MapSelectionService, useValue: mapSelectionSpy },
                provideHttpClientTesting(),
            ],
        });

        service = TestBed.inject(LobbyCreationService);
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
            expect(service.selectionStatus).toBe(LOBBY_CREATION_STATUS.noSelection);
        });
    });

    it('the selected map being in the list should be valid', () => {
        Object.defineProperty(mapSelectionSpy, 'selectedMap', {
            get: () => mockMap,
        });
        mapAPISpy.getMapById.and.returnValue(of(mockMap));
        service.isSelectionValid().subscribe((isValid: boolean) => {
            expect(isValid).toBeTrue();
            expect(service.selectionStatus).toBe(LOBBY_CREATION_STATUS.success);
        });
    });

    it('the selected map no longer being in the list should not be valid', () => {
        Object.defineProperty(mapSelectionSpy, 'selectedMap', {
            get: () => mockMap,
        });
        mapAPISpy.getMapById.and.returnValue(throwError(() => new Error('No map matches this id!')));
        service.isSelectionValid().subscribe((isValid: boolean) => {
            expect(isValid).toBeFalse();
            expect(service.selectionStatus).toBe(LOBBY_CREATION_STATUS.noLongerExists);
        });
    });

    it('the selected map being invisible should not be valid', () => {
        Object.defineProperty(mapSelectionSpy, 'selectedMap', {
            get: () => invisibleMockMap,
        });
        mapAPISpy.getMapById.and.returnValue(of(invisibleMockMap));
        service.isSelectionValid().subscribe((isValid: boolean) => {
            expect(isValid).toBeFalse();
            expect(service.selectionStatus).toBe(LOBBY_CREATION_STATUS.isNotVisible);
        });
    });

    it('any selection should be maybe valid', () => {
        Object.defineProperty(mapSelectionSpy, 'selectedMap', {
            get: () => mockMap,
        });
        expect(service.isSelectionMaybeValid()).toBeTrue();
    });

    it('an invalid map should not create a room', () => {
        spyOn(service, 'isSelectionValid').and.returnValue(of(false));
        service.submitCreation().subscribe((room: Room | null) => {
            expect(room).toBeNull();
        });
    });

    it('a valid map should create a room', () => {
        spyOn(service, 'isSelectionValid').and.returnValue(of(true));
        roomAPISpy.createRoom.and.returnValue(of(mockRoom));
        service.submitCreation().subscribe((room: Room | null) => {
            expect(roomAPISpy.createRoom).toHaveBeenCalled();
            expect(room).toEqual(mockRoom);
        });
    });
});
