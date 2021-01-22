import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InvestmentIncomeTableComponent } from './investment-income-table.component';

describe('InvestmentIncomeTableComponent', () => {
  let component: InvestmentIncomeTableComponent;
  let fixture: ComponentFixture<InvestmentIncomeTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InvestmentIncomeTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvestmentIncomeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
