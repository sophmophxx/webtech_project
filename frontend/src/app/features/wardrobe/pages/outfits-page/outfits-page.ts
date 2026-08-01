import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { OutfitService } from '../../../../core/services/outfit.service';
import { Outfit } from '../../../../shared/models/outfit.model';

@Component({
  selector: 'app-outfits-page',
  imports: [RouterLink, MatProgressSpinnerModule],
  templateUrl: './outfits-page.html',
  styleUrl: './outfits-page.scss',
})
export class OutfitsPage implements OnInit {
  private readonly outfitService = inject(OutfitService);

  readonly outfits = signal<Outfit[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  /**
   * Loads all saved outfits when the outfits overview is opened.
   */
  ngOnInit(): void {
    this.loadOutfits();
  }

  private loadOutfits(): void {
    this.outfitService.getOutfits().subscribe({
      next: (outfits) => {
        this.outfits.set(outfits.filter((outfit) => outfit.items.length > 0));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Outfits could not be loaded.');
        this.isLoading.set(false);
      },
    });
  }
}
