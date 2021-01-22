import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BalanceSheetEntryTableComponent } from './balance-sheet-entry-table.component';

describe('BalanceSheetEntryTableComponent', () => {
  let component: BalanceSheetEntryTableComponent;
  let fixture: ComponentFixture<BalanceSheetEntryTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ BalanceSheetEntryTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BalanceSheetEntryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
