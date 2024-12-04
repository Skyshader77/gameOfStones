import { AI_ERROR_MESSAGE, GATEWAY_ERROR_MESSAGE, TURN_CHANGE_TIMER_ERROR } from '@app/constants/error.constants';
import { Gateway } from '@common/enums/gateway.enum';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { ErrorMessageService } from './error-message.service';

describe('ErrorMessageService', () => {
    let service: ErrorMessageService;
    let logger: SinonStubbedInstance<Logger>;

    beforeEach(async () => {
        logger = createStubInstance(Logger);
        const module: TestingModule = await Test.createTestingModule({
            providers: [ErrorMessageService, { provide: Logger, useValue: logger }],
        }).compile();
        service = module.get<ErrorMessageService>(ErrorMessageService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('gatewayError', () => {
        it('should log gateway error with correct message and error', () => {
            const gateway = Gateway.Game;
            const event = 'test-event';
            const mockError = new Error('Gateway test error');

            service.gatewayError(gateway, event, mockError);

            expect(logger.error.calledWith(`[${gateway}] ${GATEWAY_ERROR_MESSAGE}${event}`)).toBeTruthy();

            expect(logger.error.calledWith(mockError)).toBeTruthy();
        });
    });

    describe('aiError', () => {
        it('should log AI error with correct message and error', () => {
            const mockError = new Error('AI test error');

            service.aiError(mockError);

            expect(logger.error.calledWith(AI_ERROR_MESSAGE)).toBeTruthy();

            expect(logger.error.calledWith(mockError)).toBeTruthy();
        });
    });

    describe('turnChangeTimerError', () => {
        it('should log turn change timer error with correct message and error', () => {
            const mockError = new Error('Turn change timer test error');

            service.turnChangeTimerError(mockError);

            expect(logger.error.calledWith(TURN_CHANGE_TIMER_ERROR)).toBeTruthy();

            expect(logger.error.calledWith(mockError)).toBeTruthy();
        });
    });
});
