import { TestBed } from '@angular/core/testing';

import { MOCK_MODAL_MESSAGE } from '@app/constants/tests.constants';
import { ModalMessage } from '@app/interfaces/modal-message';
import { ModalMessageService } from './modal-message.service';

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
                expect(message).toEqual(MOCK_MODAL_MESSAGE);
                done();
            },
        });

        service.showMessage(MOCK_MODAL_MESSAGE);
    });

    it('should observe a deicision message on showDecisionMessage', (done) => {
        service.decisionMessage$.subscribe({
            next: (message: ModalMessage) => {
                expect(message).toEqual(MOCK_MODAL_MESSAGE);
                done();
            },
        });

        service.showDecisionMessage(MOCK_MODAL_MESSAGE);
    });

    it('should store a message using setMessage', () => {
        service.setMessage(MOCK_MODAL_MESSAGE);
        expect(service.getStoredMessage()).toEqual(MOCK_MODAL_MESSAGE);
    });

    it('should retrieve stored message correctly', () => {
        service.setMessage(MOCK_MODAL_MESSAGE);
        const storedMessage = service.getStoredMessage();
        expect(storedMessage).toEqual(MOCK_MODAL_MESSAGE);
    });

    it('should retrieve stored decision message correctly', () => {
        service.setMessage(MOCK_MODAL_MESSAGE);
        const storedMessage = service.getStoredMessage();
        expect(storedMessage).toEqual(MOCK_MODAL_MESSAGE);
    });

    it('should return null if no stored message is set', () => {
        service.setMessage(null);
        expect(service.getStoredMessage()).toBeNull();
    });
});
