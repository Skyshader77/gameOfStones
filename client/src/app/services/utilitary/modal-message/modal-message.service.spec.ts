import { TestBed } from '@angular/core/testing';

import { MOCK_MODAL_MESSAGE, MOCK_MODAL_MESSAGE_WITH_INPUT } from '@app/constants/tests.constants';
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

    it('should observe a decision message on showDecisionMessage', (done) => {
        service.decisionMessage$.subscribe({
            next: (message: ModalMessage) => {
                expect(message).toEqual(MOCK_MODAL_MESSAGE);
                done();
            },
        });

        service.showDecisionMessage(MOCK_MODAL_MESSAGE);
    });

    it('should emit input message when showInputPrompt is called', (done) => {
        const testInputMessage = 'Test input prompt';
        service.inputMessage$.subscribe({
            next: (input: string) => {
                expect(input).toEqual(testInputMessage);
                done();
            }
        });

        service.emitUserInput(testInputMessage);
    });

    it('should emit message on showInputPrompt', (done) => {
        service.message$.subscribe({
            next: (message: ModalMessage) => {
                expect(message).toEqual(MOCK_MODAL_MESSAGE_WITH_INPUT);
                done();
            }
        });
    
        service.showInputPrompt(MOCK_MODAL_MESSAGE_WITH_INPUT);
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

    it('should clear a stored message', () => {
        service.setMessage(MOCK_MODAL_MESSAGE);
        service.clearMessage();
        expect(service.getStoredMessage()).toBeNull();
    })
});
