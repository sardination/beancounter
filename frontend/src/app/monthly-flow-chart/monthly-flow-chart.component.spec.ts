import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MonthlyFlowChartComponent } from './monthly-flow-chart.component';

describe('MonthlyFlowChartComponent', () => {
  let component: MonthlyFlowChartComponent;
  let fixture: ComponentFixture<MonthlyFlowChartComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthlyFlowChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthlyFlowChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
