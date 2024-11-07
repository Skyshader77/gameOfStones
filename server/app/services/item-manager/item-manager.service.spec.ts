import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ItemManagerService } from './item-manager.service';

describe('GameTurnService', () => {
    let service: ItemManagerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ItemManagerService, Logger],
        }).compile();
        service = module.get<ItemManagerService>(ItemManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
