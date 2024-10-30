import { Test, TestingModule } from '@nestjs/testing';
import { JournalManagerService } from './journal-manager.service';

describe('JournalManagerService', () => {
    let service: JournalManagerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [JournalManagerService],
        }).compile();

        service = module.get<JournalManagerService>(JournalManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
