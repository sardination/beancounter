import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeRateTableComponent } from './exchange-rate-table.component';

describe('ExchangeRateTableComponent', () => {
  let component: ExchangeRateTableComponent;
  let fixture: ComponentFixture<ExchangeRateTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExchangeRateTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExchangeRateTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
