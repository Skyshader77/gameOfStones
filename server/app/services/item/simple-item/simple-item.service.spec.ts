import { Test, TestingModule } from '@nestjs/testing';
import { SimpleItemService } from './simple-item.service';

describe('SimpleItemService', () => {
    let service: SimpleItemService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [SimpleItemService],
        }).compile();

        service = module.get<SimpleItemService>(SimpleItemService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
