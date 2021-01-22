import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PriorIncomeTableComponent } from './prior-income-table.component';

describe('PriorIncomeTableComponent', () => {
  let component: PriorIncomeTableComponent;
  let fixture: ComponentFixture<PriorIncomeTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PriorIncomeTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PriorIncomeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
