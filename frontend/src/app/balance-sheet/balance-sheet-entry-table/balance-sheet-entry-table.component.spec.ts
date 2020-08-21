import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceSheetEntryTableComponent } from './balance-sheet-entry-table.component';

describe('BalanceSheetEntryTableComponent', () => {
  let component: BalanceSheetEntryTableComponent;
  let fixture: ComponentFixture<BalanceSheetEntryTableComponent>;

  beforeEach(async(() => {
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
