import { TestBed } from '@angular/core/testing';

import { GameMapService } from './game-map.service';
import { TileTerrain } from '@common/enums/tile-terrain.enum';
import { Vec2 } from '@common/interfaces/vec2';

describe('GameMapService', () => {
    let service: GameMapService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameMapService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should update the door state at the specified position', () => {
        const doorPosition: Vec2 = { x: 1, y: 1 };
        const newTerrain = TileTerrain.OpenDoor;
        service.updateDoorState(newTerrain, doorPosition);
        expect(service.map.mapArray[doorPosition.y][doorPosition.x]).toBe(newTerrain);
    });

    it('should handle different terrain types', () => {
        const position: Vec2 = { x: 1, y: 1 };
        const terrainTypes = [TileTerrain.Grass, TileTerrain.Wall, TileTerrain.Water];
        terrainTypes.forEach((terrain) => {
            service.updateDoorState(terrain, position);
            expect(service.map.mapArray[position.y][position.x]).toBe(terrain);
        });
    });

    it('should preserve other map tiles when updating a door', () => {
        const initialMap = JSON.parse(JSON.stringify(service.map.mapArray));
        const position: Vec2 = { x: 1, y: 1 };
        service.updateDoorState(TileTerrain.OpenDoor, position);
        for (let y = 0; y < service.map.size; y++) {
            for (let x = 0; x < service.map.size; x++) {
                if (x !== position.x || y !== position.y) {
                    expect(service.map.mapArray[y][x]).toBe(initialMap[y][x]);
                }
            }
        }
    });
});
