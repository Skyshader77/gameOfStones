import { TestBed } from '@angular/core/testing';

import { GameMapInputService } from './game-map-input.service';

describe('GameMapInputService', () => {
  let service: GameMapInputService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameMapInputService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
