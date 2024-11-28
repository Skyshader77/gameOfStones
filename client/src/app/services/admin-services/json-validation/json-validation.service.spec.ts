import { TestBed } from '@angular/core/testing';

import { JsonValidationService } from './json-validation.service';
import { MOCK_CREATION_MAPS } from '@app/constants/tests.constants';
import { TileTerrain } from '@common/enums/tile-terrain.enum';

describe('JsonValidationService', () => {
    let service: JsonValidationService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(JsonValidationService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should validate a valid map', () => {
        const result = service.validateMap(MOCK_CREATION_MAPS.validMap);
        expect(result.isValid).toBeTruthy();
    });

    it('should fail validation for map with invalid size', () => {
        const result = service.validateMap(MOCK_CREATION_MAPS.invalidMapSize);
        expect(result.isValid).toBeFalsy();
    });

    it('should fail validation for map with invalid mode', () => {
        const result = service.validateMap(MOCK_CREATION_MAPS.invalidMode);
        expect(result.isValid).toBeFalsy();
    });

    it('should fail validation for map with invalid row size', () => {
        const result = service.validateMap(MOCK_CREATION_MAPS.invalidRows);
        expect(result.isValid).toBeFalsy();
    });

    it('should fail validation for map with invalid col size', () => {
        const result = service.validateMap(MOCK_CREATION_MAPS.invalidCols);
        expect(result.isValid).toBeFalsy();
    });

    it('should fail validation for map with invalid tile', () => {
        const result = service.validateMap(MOCK_CREATION_MAPS.invalidTileNumber);
        expect(result.isValid).toBeFalsy();
    })

    it('should fail validation for map with out of bounds item', () => {
        const result = service.validateMap(MOCK_CREATION_MAPS.invalidItemNumber);
        expect(result.isValid).toBeFalsy();
    })

    it('should fail validation for map with items out of bounds of the map', () => {
        const result = service.validateMap(MOCK_CREATION_MAPS.invalidItemRange);
        expect(result.isValid).toBeFalsy();
    })

    it("should fail validation for an item that's on an invalid tile", () => {
        const mockMap = JSON.parse(JSON.stringify(MOCK_CREATION_MAPS.validMap));
        mockMap.mapArray[0][0] = TileTerrain.ClosedDoor;
        const result = service.validateMap(mockMap);
        expect(result.isValid).toBeFalsy();
    })

    it("should fail validation for a tile that has two or more items", () => {
        const result = service.validateMap(MOCK_CREATION_MAPS.invalidSuperposedItems);
        expect(result.isValid).toBeFalsy();
    })

    it("should fail validation for a tile that is not a number", () => {
        const mockMap = JSON.parse(JSON.stringify(MOCK_CREATION_MAPS.validMap));
        mockMap.mapArray[0][0] = "";
        const result = service.validateMap(mockMap);
        expect(result.isValid).toBeFalsy();
    })

    it('should handle Vec2 placeholders', () => {
        const template = 'Invalid position: ${itemPosition}';
        const result = service['interpolateMessage'](template, { 
            itemPosition: { x: 5, y: 7 } 
        });
        expect(result).toBe('Invalid position: (5, 7)');
    });
});
