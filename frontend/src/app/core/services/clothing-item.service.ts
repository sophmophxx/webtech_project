import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ITEMS_API_URL } from '../constants/api.constants';
import { ClothingItem } from '../../shared/models/clothing-item.model';

export type CreateClothingItemRequest = Omit<ClothingItem, '_id' | 'createdAt' | 'updatedAt'>;

export type UpdateClothingItemRequest = Partial<CreateClothingItemRequest>;

@Injectable({
  providedIn: 'root',
})
export class ClothingItemService {
  private readonly http = inject(HttpClient);

  getItems(): Observable<ClothingItem[]> {
    return this.http.get<ClothingItem[]>(ITEMS_API_URL);
  }

  getItemById(id: string): Observable<ClothingItem> {
    return this.http.get<ClothingItem>(`${ITEMS_API_URL}/${id}`);
  }

  createItem(payload: CreateClothingItemRequest): Observable<ClothingItem> {
    return this.http.post<ClothingItem>(ITEMS_API_URL, payload);
  }

  updateItem(id: string, payload: UpdateClothingItemRequest): Observable<ClothingItem> {
    return this.http.patch<ClothingItem>(`${ITEMS_API_URL}/${id}`, payload);
  }

  deleteItem(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${ITEMS_API_URL}/${id}`);
  }
}
