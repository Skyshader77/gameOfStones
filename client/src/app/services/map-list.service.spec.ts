import { TestBed } from '@angular/core/testing';

import { MapListService} from './map-list.service';

describe('MapListServiceService', () => {
  let service: MapListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
