import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIProjectionPageComponent } from './fi-projection-page.component';

describe('FIProjectionPageComponent', () => {
  let component: FIProjectionPageComponent;
  let fixture: ComponentFixture<FIProjectionPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FIProjectionPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FIProjectionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
