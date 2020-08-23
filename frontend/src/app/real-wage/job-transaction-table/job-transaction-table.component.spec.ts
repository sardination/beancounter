import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobTransactionTableComponent } from './job-transaction-table.component';

describe('JobTransactionTableComponent', () => {
  let component: JobTransactionTableComponent;
  let fixture: ComponentFixture<JobTransactionTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobTransactionTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobTransactionTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
