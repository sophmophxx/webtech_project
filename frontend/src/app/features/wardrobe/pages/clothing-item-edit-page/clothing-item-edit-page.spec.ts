import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { ClothingItemEditPage } from './clothing-item-edit-page';

describe('ClothingItemEditPage', () => {
  let component: ClothingItemEditPage;
  let fixture: ComponentFixture<ClothingItemEditPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClothingItemEditPage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClothingItemEditPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
