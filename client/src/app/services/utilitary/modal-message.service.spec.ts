import { TestBed } from '@angular/core/testing';

import { ModalMessageService } from './modal-message.service';
import { ModalMessage } from '@app/interfaces/modal-message';
import { MOCK_ERROR_MESSAGE } from '@app/constants/tests.constants';

describe('ModalMessageService', () => {
    let service: ModalMessageService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ModalMessageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should observe a message on showMessage', (done) => {
        service.message$.subscribe({
            next: (message: ModalMessage) => {
                expect(message).toEqual(MOCK_ERROR_MESSAGE);
                done();
            },
        });

        service.showMessage(MOCK_ERROR_MESSAGE);
    });
});
