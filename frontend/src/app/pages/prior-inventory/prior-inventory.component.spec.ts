import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriorInventoryComponent } from './prior-inventory.component';

describe('PriorInventoryComponent', () => {
  let component: PriorInventoryComponent;
  let fixture: ComponentFixture<PriorInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PriorInventoryComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PriorInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
