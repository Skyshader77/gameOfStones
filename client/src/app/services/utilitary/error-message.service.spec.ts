import { TestBed } from '@angular/core/testing';

import { ErrorMessageService } from './error-message.service';
import { ErrorMessage } from '@app/interfaces/error';
import { MOCK_ERROR_MESSAGE } from '@app/constants/tests.constants';

describe('ErrorMessageService', () => {
    let service: ErrorMessageService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ErrorMessageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should observe a null on reset', () => {
        service.reset();
        service.message$.subscribe({
            next: (message: ErrorMessage | null) => {
                expect(message).toBeNull();
            },
        });
    });

    it('should observe a message on showMessage', () => {
        service.showMessage(MOCK_ERROR_MESSAGE);
        service.message$.subscribe({
            next: (message: ErrorMessage | null) => {
                expect(message).toEqual(MOCK_ERROR_MESSAGE);
            },
        });
    });
});
