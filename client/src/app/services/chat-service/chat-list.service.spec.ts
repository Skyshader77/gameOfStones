import { TestBed } from '@angular/core/testing';

import { ChatListService } from './chat-list.service';

describe('ChatServiceService', () => {
    let service: ChatListService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ChatListService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
