import { Component, inject, OnInit, signal } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatIconModule } from "@angular/material/icon";

import { ClothingItemService } from "../../../../core/services/clothing-item.service";
import { ClothingItem } from "../../../../shared/models/clothing-item.model";

@Component({
  selector: "app-wardrobe-page",
  imports: [MatCardModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: "./wardrobe-page.html",
  styleUrl: "./wardrobe-page.scss",
})
export class WardrobePage implements OnInit {
  private readonly clothingItemService = inject(ClothingItemService);

  readonly items = signal<ClothingItem[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadItems();
  }

  private loadItems(): void {
    this.clothingItemService.getItems().subscribe({
      next: (items) => {
        this.items.set(items);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set("Kleidungsstücke konnten nicht geladen werden.");
        this.isLoading.set(false);
      },
    });
  }
}
