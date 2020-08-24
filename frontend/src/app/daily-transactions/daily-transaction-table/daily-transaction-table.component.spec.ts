import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyTransactionTableComponent } from './daily-transaction-table.component';

describe('DailyTransactionTableComponent', () => {
  let component: DailyTransactionTableComponent;
  let fixture: ComponentFixture<DailyTransactionTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DailyTransactionTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyTransactionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
