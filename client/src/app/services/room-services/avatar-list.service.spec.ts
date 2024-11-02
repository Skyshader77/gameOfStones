import { TestBed } from '@angular/core/testing';

import { AvatarListService } from './avatar-list.service';

describe('AvatarListService', () => {
    let service: AvatarListService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AvatarListService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
