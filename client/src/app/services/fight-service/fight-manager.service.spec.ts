import { TestBed } from '@angular/core/testing';

import { FightManagerService } from './fight-manager.service';

describe('FightManagerService', () => {
  let service: FightManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FightManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
