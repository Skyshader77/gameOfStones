import { Test, TestingModule } from '@nestjs/testing';
import { GameTimeService } from './game-time.service';

describe('GameTimeService', () => {
  let service: GameTimeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GameTimeService],
    }).compile();

    service = module.get<GameTimeService>(GameTimeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
