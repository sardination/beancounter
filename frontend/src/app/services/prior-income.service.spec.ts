import { TestBed } from '@angular/core/testing';

import { PriorIncomeService } from './prior-income.service';

describe('PriorIncomeService', () => {
  let service: PriorIncomeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PriorIncomeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
