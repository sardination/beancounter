import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WageCalculatorComponent } from './wage-calculator.component';

describe('WageCalculatorComponent', () => {
  let component: WageCalculatorComponent;
  let fixture: ComponentFixture<WageCalculatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WageCalculatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WageCalculatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
