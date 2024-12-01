import { Test, TestingModule } from '@nestjs/testing';
import { SpecialItemService } from './special-item.service';

describe('SimpleItemService', () => {
    let service: SpecialItemService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SpecialItemService],
        }).compile();

        service = module.get<SpecialItemService>(SpecialItemService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
