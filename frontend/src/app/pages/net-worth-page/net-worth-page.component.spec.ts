import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetWorthPageComponent } from './net-worth-page.component';

describe('NetWorthPageComponent', () => {
  let component: NetWorthPageComponent;
  let fixture: ComponentFixture<NetWorthPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NetWorthPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NetWorthPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
