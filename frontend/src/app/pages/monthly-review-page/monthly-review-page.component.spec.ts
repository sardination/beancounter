import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyReviewPageComponent } from './monthly-review-page.component';

describe('MonthlyReviewPageComponent', () => {
  let component: MonthlyReviewPageComponent;
  let fixture: ComponentFixture<MonthlyReviewPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonthlyReviewPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthlyReviewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
