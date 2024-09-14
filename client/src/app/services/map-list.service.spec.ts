import { TestBed } from '@angular/core/testing';

import { GameMode, Item, Map, TileTerrain } from '@app/interfaces/map';
import { MapListService } from './map-list.service';

describe('MapListService', () => {
    let service: MapListService;
    let selectedMap: Map | null;
    let mapList: Map[];

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MapListService);

        selectedMap = null;
        mapList = [
            {
                mapId: '0',
                name: 'Map 0',
                description: 'This is a mockMap',
                rowSize: 1,
                mode: GameMode.NORMAL,
                mapArray: [{ terrain: TileTerrain.GRASS, item: Item.NONE }],
                lastModification: new Date(),
            },
        ];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should choose map in list if index is valid', () => {
        service.mapList = mapList;
        service.chooseSelectedMap(0);
        expect(service.selectedMap).toBe(mapList[0]);
    });

    it('should not choose map in list if index is invalid', () => {
        service.chooseSelectedMap(1);
        expect(service.selectedMap).toBe(selectedMap);
    });
});
