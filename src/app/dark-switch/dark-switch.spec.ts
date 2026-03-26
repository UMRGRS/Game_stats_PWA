import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DarkSwitch } from './dark-switch';

describe('DarkSwitch', () => {
  let component: DarkSwitch;
  let fixture: ComponentFixture<DarkSwitch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DarkSwitch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DarkSwitch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
