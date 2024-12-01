import { DoorOpeningService } from '@app/services/door-opening/door-opening.service';
import { Test, TestingModule } from '@nestjs/testing';
import * as sinon from 'sinon';
import { createStubInstance } from 'sinon';
import { ActionService } from './action.service';
describe('ActionService', () => {
    let service: ActionService;
    let doorManagerService: sinon.SinonStubbedInstance<DoorOpeningService>;
    beforeEach(async () => {
        doorManagerService = createStubInstance<DoorOpeningService>(DoorOpeningService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [ActionService, { provide: DoorOpeningService, useValue: doorManagerService }],
        }).compile();

        service = module.get<ActionService>(ActionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
