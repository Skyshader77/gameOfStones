import { TestBed } from '@angular/core/testing';

import { GameLogicSocketService } from './game-logic-socket.service';

describe('GameLogicSocketService', () => {
    let service: GameLogicSocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameLogicSocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
