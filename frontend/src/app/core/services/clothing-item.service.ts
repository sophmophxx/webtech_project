import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ITEMS_API_URL } from '../constants/api.constants';
import { ClothingItem } from '../../shared/models/clothing-item.model';

/**
 * Payload used when creating a new clothing item.
 * Database-generated fields are excluded because they are created by the backend.
 */
export type CreateClothingItemRequest = Omit<ClothingItem, '_id' | 'createdAt' | 'updatedAt'>;

/**
 * Payload used when updating an existing clothing item.
 * All fields are optional because PATCH requests can update only selected values.
 */
export type UpdateClothingItemRequest = Partial<CreateClothingItemRequest>;

/**
 * Handles all HTTP requests related to clothing items.
 * Components use this service instead of calling the backend API directly.
 */
@Injectable({
  providedIn: 'root',
})
export class ClothingItemService {
  private readonly http = inject(HttpClient);

  /**
   * Loads all clothing items from the backend.
   */
  getItems(): Observable<ClothingItem[]> {
    return this.http.get<ClothingItem[]>(ITEMS_API_URL);
  }

  /**
   * Loads a single clothing item by its id.
   */
  getItemById(id: string): Observable<ClothingItem> {
    return this.http.get<ClothingItem>(`${ITEMS_API_URL}/${id}`);
  }

  /**
   * Creates a new clothing item.
   */
  createItem(payload: CreateClothingItemRequest): Observable<ClothingItem> {
    return this.http.post<ClothingItem>(ITEMS_API_URL, payload);
  }

  /**
   * Updates an existing clothing item with partial data.
   */
  updateItem(id: string, payload: UpdateClothingItemRequest): Observable<ClothingItem> {
    return this.http.patch<ClothingItem>(`${ITEMS_API_URL}/${id}`, payload);
  }

  /**
   * Deletes a clothing item by its id.
   */
  deleteItem(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${ITEMS_API_URL}/${id}`);
  }
}
