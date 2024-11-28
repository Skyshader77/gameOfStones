import { TestBed } from '@angular/core/testing';

import { JsonValidationService } from './json-validation.service';
import { MOCK_INVALID_MAPSIZE_CREATION_MAP, MOCK_VALID_CREATION_MAP, MOCK_INVALID_MODE_CREATION_MAP } from '@app/constants/tests.constants';

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
        const result = service.validateMap(MOCK_VALID_CREATION_MAP);
        expect(result.isValid).toBeTruthy();
    })

    it('should fail validation for map with invalid size', () => {
        const result = service.validateMap(MOCK_INVALID_MAPSIZE_CREATION_MAP);
        expect(result.isValid).toBeFalsy();
    })

    it('should fail validation for map with invalid mode', () => {
        const result = service.validateMap(MOCK_INVALID_MODE_CREATION_MAP);
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
