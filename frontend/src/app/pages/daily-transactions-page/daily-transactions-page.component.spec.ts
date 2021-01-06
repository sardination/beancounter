import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyTransactionsPageComponent } from './daily-transactions-page.component';

describe('DailyTransactionsPageComponent', () => {
  let component: DailyTransactionsPageComponent;
  let fixture: ComponentFixture<DailyTransactionsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DailyTransactionsPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyTransactionsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
