import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CategoryTotalsComponent } from './category-totals.component';

describe('CategoryTotalsComponent', () => {
  let component: CategoryTotalsComponent;
  let fixture: ComponentFixture<CategoryTotalsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CategoryTotalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryTotalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
