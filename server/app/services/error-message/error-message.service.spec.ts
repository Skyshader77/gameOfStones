import { Test, TestingModule } from '@nestjs/testing';
import { ErrorMessageService } from './error-message.service';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { Logger } from '@nestjs/common';

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
});
