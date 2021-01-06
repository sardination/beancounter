import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriorInventoryPageComponent } from './prior-inventory-page.component';

describe('PriorInventoryPageComponent', () => {
  let component: PriorInventoryPageComponent;
  let fixture: ComponentFixture<PriorInventoryPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriorInventoryPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriorInventoryPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
