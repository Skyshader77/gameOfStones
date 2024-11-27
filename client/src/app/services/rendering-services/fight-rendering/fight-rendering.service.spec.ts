import { TestBed } from '@angular/core/testing';
import { FightRenderingService } from './fight-rendering.service';

describe('FightRenderingService', () => {
    let service: FightRenderingService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FightRenderingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
