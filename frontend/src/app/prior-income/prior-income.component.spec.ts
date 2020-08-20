import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PriorIncomeComponent } from './prior-income.component';

describe('PriorIncomeListComponent', () => {
  let component: PriorIncomeComponent;
  let fixture: ComponentFixture<PriorIncomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PriorIncomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PriorIncomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
