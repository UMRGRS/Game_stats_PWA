import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sorterer } from './sorterer';

describe('Sorterer', () => {
  let component: Sorterer;
  let fixture: ComponentFixture<Sorterer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sorterer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sorterer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
