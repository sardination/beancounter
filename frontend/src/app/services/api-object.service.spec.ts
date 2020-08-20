import { TestBed } from '@angular/core/testing';

import { ApiObjectService } from './api-object.service';

describe('ApiObjectService', () => {
  let service: ApiObjectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiObjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
