import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RealWageComponent } from './real-wage.component';

describe('RealWageComponent', () => {
  let component: RealWageComponent;
  let fixture: ComponentFixture<RealWageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RealWageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RealWageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
