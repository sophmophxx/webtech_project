import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WardrobePage } from './wardrobe-page';

describe('WardrobePage', () => {
  let component: WardrobePage;
  let fixture: ComponentFixture<WardrobePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WardrobePage],
    }).compileComponents();

    fixture = TestBed.createComponent(WardrobePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
