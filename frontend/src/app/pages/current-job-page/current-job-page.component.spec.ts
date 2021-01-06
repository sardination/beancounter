import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentJobPageComponent } from './current-job-page.component';

describe('CurrentJobPageComponent', () => {
  let component: CurrentJobPageComponent;
  let fixture: ComponentFixture<CurrentJobPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CurrentJobPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentJobPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
