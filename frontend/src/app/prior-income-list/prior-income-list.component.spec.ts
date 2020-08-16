import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PriorIncomeListComponent } from './prior-income-list.component';

describe('PriorIncomeListComponent', () => {
  let component: PriorIncomeListComponent;
  let fixture: ComponentFixture<PriorIncomeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PriorIncomeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PriorIncomeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
