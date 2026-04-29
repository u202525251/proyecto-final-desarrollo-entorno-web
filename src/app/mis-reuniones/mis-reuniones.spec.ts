import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisReuniones } from './mis-reuniones';

describe('MisReuniones', () => {
  let component: MisReuniones;
  let fixture: ComponentFixture<MisReuniones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisReuniones],
    }).compileComponents();

    fixture = TestBed.createComponent(MisReuniones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
