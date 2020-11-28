import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetAccountTableComponent } from './asset-account-table.component';

describe('AssetAccountTableComponent', () => {
  let component: AssetAccountTableComponent;
  let fixture: ComponentFixture<AssetAccountTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetAccountTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetAccountTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
