import { TestBed } from '@angular/core/testing';

import { MapAdminServiceService } from './map-admin-service.service';

describe('MapAdminServiceService', () => {
  let service: MapAdminServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapAdminServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
