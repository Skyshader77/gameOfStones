import { TestBed } from '@angular/core/testing';

import { JsonValidationService } from './json-validation.service';

describe('JsonValidationService', () => {
  let service: JsonValidationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JsonValidationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
