import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClothingItemForm } from './clothing-item-form';

describe('ClothingItemForm', () => {
  let component: ClothingItemForm;
  let fixture: ComponentFixture<ClothingItemForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClothingItemForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ClothingItemForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
