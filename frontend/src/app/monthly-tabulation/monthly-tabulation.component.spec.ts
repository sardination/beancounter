import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyTabulationComponent } from './monthly-tabulation.component';

describe('MonthlyTabulationComponent', () => {
  let component: MonthlyTabulationComponent;
  let fixture: ComponentFixture<MonthlyTabulationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthlyTabulationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthlyTabulationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
