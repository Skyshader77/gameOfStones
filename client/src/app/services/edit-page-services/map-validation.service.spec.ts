import { TestBed } from '@angular/core/testing';
import { CreationMap, GameMode, Item, MapSize, TileTerrain } from '@app/interfaces/map';
import { MapManagerService } from './map-manager.service';
import { MapValidationService } from './map-validation.service';
import SpyObj = jasmine.SpyObj;

describe('MapValidationService', () => {
    let service: MapValidationService;
    let mapManagerServiceSpy: SpyObj<MapManagerService>;

    const mockMapGrassOnly: CreationMap = {
        name: 'Mock Map Grass Only',
        description: '',
        size: MapSize.SMALL,
        mode: GameMode.NORMAL,
        mapArray: Array.from({ length: MapSize.SMALL }, () =>
            Array.from({ length: MapSize.SMALL }, () => ({ terrain: TileTerrain.GRASS, item: Item.NONE })),
        ),
        placedItems: [],
    };

    beforeEach(() => {
        mapManagerServiceSpy = jasmine.createSpyObj('MapManagerService', ['isItemLimitReached']);
        TestBed.overrideProvider(MapManagerService, { useValue: mapManagerServiceSpy });
        TestBed.configureTestingModule({
            providers: [MapValidationService],
        });
        service = TestBed.inject(MapValidationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should show that a grass-only map is wholly accessible', () => {
        expect(service.isWholeMapAccessible(mockMapGrassOnly)).toEqual(true);
    });

    it('should consider door surrondings valid on a map without doors', () => {
        expect(service.areDoorSurroundingsValid(mockMapGrassOnly)).toEqual(true);
    });

    it('should consider door surrondings valid on a map with only valid doors', () => {
        const mockMapValidDoors: CreationMap = {
            name: 'Mock Map Valid Doors',
            description: '',
            size: MapSize.SMALL,
            mode: GameMode.NORMAL,
            mapArray: mockMapGrassOnly.mapArray.map((row) => row.map((tile) => ({ ...tile }))),
            placedItems: [],
        };
        const mockWallRow1 = 4;
        const mockWallRow2 = 6;
        const mockDoorRow = 5;
        const mockCol = 3;
        mockMapValidDoors.mapArray[mockWallRow1][mockCol].terrain = TileTerrain.WALL;
        mockMapValidDoors.mapArray[mockWallRow2][mockCol].terrain = TileTerrain.WALL;
        mockMapValidDoors.mapArray[mockDoorRow][mockCol].terrain = TileTerrain.CLOSEDDOOR;
        expect(service.areDoorSurroundingsValid(mockMapGrassOnly)).toEqual(true);
    });

    it('should consider door and wall amount valid on an empty map', () => {
        expect(service.isDoorAndWallNumberValid(mockMapGrassOnly)).toEqual(true);
    });

    it('should consider door and wall amount invalid on an map with too many walls and doors', () => {
        const mockMapInvalidDoorAndWallNumber: CreationMap = {
            name: 'Mock Map Invalid Doors And Walls',
            description: '',
            size: MapSize.SMALL,
            mode: GameMode.NORMAL,
            mapArray: mockMapGrassOnly.mapArray.map((row) => row.map((tile) => ({ ...tile }))),
            placedItems: [],
        };
        for (let rowIndex = 0; rowIndex < mockMapGrassOnly.size / 2; rowIndex++) {
            for (let colIndex = 0; colIndex < mockMapGrassOnly.size; colIndex++) {
                mockMapInvalidDoorAndWallNumber.mapArray[rowIndex][colIndex].terrain =
                    rowIndex + (colIndex % 2) === 0 ? TileTerrain.WALL : TileTerrain.CLOSEDDOOR; // Fill a quarter of the map with walls, and another quarter with doors, making it 50% walls/doors
            }
        }
        expect(service.isDoorAndWallNumberValid(mockMapInvalidDoorAndWallNumber)).toEqual(false);
    });
});
