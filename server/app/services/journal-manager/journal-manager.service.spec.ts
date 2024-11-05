import { Test, TestingModule } from '@nestjs/testing';
import { JournalManagerService } from './journal-manager.service';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';
import { FightLogicService } from '@app/services/fight/fight/fight-logic.service';

describe('JournalManagerService', () => {
    let service: JournalManagerService;
    let roomManagerService: SinonStubbedInstance<RoomManagerService>;
    let fightLogicService: SinonStubbedInstance<FightLogicService>;

    beforeEach(async () => {
        roomManagerService = createStubInstance(RoomManagerService);
        fightLogicService = createStubInstance(FightLogicService);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JournalManagerService,
                {
                    provide: RoomManagerService,
                    useValue: roomManagerService,
                },
                {
                    provide: FightLogicService,
                    useValue: fightLogicService,
                },
            ],
        }).compile();

        service = module.get<JournalManagerService>(JournalManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
