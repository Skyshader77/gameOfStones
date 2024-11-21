import { TestBed } from '@angular/core/testing';

import { GameStatsStateService } from './game-stats-state.service';

describe('GameStatsStateService', () => {
    let service: GameStatsStateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameStatsStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
