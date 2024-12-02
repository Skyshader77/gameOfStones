import { Test, TestingModule } from '@nestjs/testing';
import { SpecialItemService } from './special-item.service';
import { SinonStubbedInstance, createStubInstance } from 'sinon';
import { RoomManagerService } from '@app/services/room-manager/room-manager.service';

describe('SimpleItemService', () => {
    let service: SpecialItemService;
    let roomManagerService: SinonStubbedInstance<RoomManagerService>;

    beforeEach(async () => {
        roomManagerService = createStubInstance<RoomManagerService>(RoomManagerService);
        const module: TestingModule = await Test.createTestingModule({
            providers: [SpecialItemService, { provide: RoomManagerService, useValue: roomManagerService }],
        }).compile();

        service = module.get<SpecialItemService>(SpecialItemService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
