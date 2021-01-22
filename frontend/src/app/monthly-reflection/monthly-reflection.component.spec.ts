import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MonthlyReflectionComponent } from './monthly-reflection.component';

describe('MonthlyReflectionComponent', () => {
  let component: MonthlyReflectionComponent;
  let fixture: ComponentFixture<MonthlyReflectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MonthlyReflectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthlyReflectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
