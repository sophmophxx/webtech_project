import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { ClothingItemCreatePage } from './clothing-item-create-page';

describe('ClothingItemCreatePage', () => {
  let component: ClothingItemCreatePage;
  let fixture: ComponentFixture<ClothingItemCreatePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClothingItemCreatePage],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClothingItemCreatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
