import { TestBed } from '@angular/core/testing';

import { MapUtilService } from './map-util.service';

describe('MapUtilService', () => {
  let service: MapUtilService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapUtilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
