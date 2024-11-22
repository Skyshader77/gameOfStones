import { Test, TestingModule } from '@nestjs/testing';
import { ConditionalItemService } from './conditional-item.service';

describe('ConditionalItemService', () => {
    let service: ConditionalItemService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [ConditionalItemService],
        }).compile();

        service = module.get<ConditionalItemService>(ConditionalItemService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
