import { TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { GameMode, Map, MapSize } from '@app/interfaces/map';
import { of, throwError } from 'rxjs';
import { LobbyCreationService } from './lobby-creation.service';
import { MapAPIService } from './map-api.service';
import { MapSelectionService } from './map-selection.service';

describe('LobbyCreationService', () => {
    let service: LobbyCreationService;
    let mapAPISpy: jasmine.SpyObj<MapAPIService>;
    let mapSelectionSpy: jasmine.SpyObj<MapSelectionService>;
    const mockMap: Map = {
        _id: '0',
        name: 'Mock Map 1',
        description: '',
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        mapArray: [],
        placedItems: [],
        isVisible: true,
        dateOfLastModification: new Date(),
    };

    beforeEach(() => {
        mapAPISpy = jasmine.createSpyObj('MapAPIService', ['getMapbyId', 'getMaps']);
        mapSelectionSpy = jasmine.createSpyObj('MapSelectionService', ['initialize', 'selectedMap'], {
            selectedMap: null,
        });
        TestBed.configureTestingModule({
            providers: [
                { provide: MapAPIService, useValue: mapAPISpy },
                { provide: MapSelectionService, useValue: mapSelectionSpy },
                provideHttpClientTesting(),
            ],
        });

        service = TestBed.inject(LobbyCreationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    // it('should initialize mapSelectionService on initialization', () => {
    //     service.initialize();

    //     expect(mapSelectionSpy.initialize).toHaveBeenCalled();
    // });

    it('should need to have selected a map for the selection to be valid', () => {
        service.isSelectionValid().subscribe((isValid: boolean) => {
            expect(isValid).toBeFalse();
        });
    });

    it('the selected map being in the list should be valid', () => {
        Object.defineProperty(mapSelectionSpy, 'selectedMap', {
            get: () => mockMap,
        });
        mapAPISpy.getMapbyId.and.returnValue(of(mockMap));
        service.isSelectionValid().subscribe((isValid: boolean) => {
            expect(isValid).toBeTrue();
        });
    });

    it('the selected map no longer being in the list should not be valid', () => {
        Object.defineProperty(mapSelectionSpy, 'selectedMap', {
            get: () => mockMap,
        });
        mapAPISpy.getMapbyId.and.returnValue(throwError(() => new Error('No map matches this id!')));
        service.isSelectionValid().subscribe((isValid: boolean) => {
            expect(isValid).toBeFalse();
        });
    });

    // TODO test for invisible map.
});
