import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyAssetAccountTableComponent } from './monthly-asset-account-table.component';

describe('MonthlyAssetAccountTableComponent', () => {
  let component: MonthlyAssetAccountTableComponent;
  let fixture: ComponentFixture<MonthlyAssetAccountTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MonthlyAssetAccountTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MonthlyAssetAccountTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
