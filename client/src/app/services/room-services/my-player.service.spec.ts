import { TestBed } from '@angular/core/testing';

import { MyPlayerService } from './my-player.service';

describe('MyPlayerService', () => {
    let service: MyPlayerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MyPlayerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
