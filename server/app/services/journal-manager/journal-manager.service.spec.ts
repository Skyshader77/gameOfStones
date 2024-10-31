import { Test, TestingModule } from '@nestjs/testing';
import { JournalManagerService } from './journal-manager.service';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';

describe('JournalManagerService', () => {
    let service: JournalManagerService;
    let roomManagerService: SinonStubbedInstance<RoomManagerService>;

    beforeEach(async () => {
        roomManagerService = createStubInstance(RoomManagerService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JournalManagerService,
                {
                    provide: RoomManagerService,
                    useValue: roomManagerService,
                },
            ],
        }).compile();

        service = module.get<JournalManagerService>(JournalManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
