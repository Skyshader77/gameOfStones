import { TestBed } from '@angular/core/testing';

import { PlayButtonsService } from './play-buttons.service';

describe('PlayButtonsService', () => {
  let service: PlayButtonsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayButtonsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
