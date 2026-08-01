import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { OutfitService } from '../../../../core/services/outfit.service';
import { Outfit } from '../../../../shared/models/outfit.model';

@Component({
  selector: 'app-outfit-detail-page',
  imports: [RouterLink, MatProgressSpinnerModule],
  templateUrl: './outfit-detail-page.html',
  styleUrl: './outfit-detail-page.scss',
})
export class OutfitDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly outfitService = inject(OutfitService);

  readonly outfit = signal<Outfit | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  /**
   * Reads the outfit id from the route and loads the matching outfit.
   */
  ngOnInit(): void {
    const outfitId = this.route.snapshot.paramMap.get('id');

    if (!outfitId) {
      this.errorMessage.set('No outfit id found.');
      this.isLoading.set(false);
      return;
    }

    this.loadOutfit(outfitId);
  }

  /**
   * Loads a single outfit including its referenced clothing items.
   */
  private loadOutfit(id: string): void {
    this.outfitService.getOutfitById(id).subscribe({
      next: (outfit) => {
        this.outfit.set(outfit);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Outfit could not be loaded.');
        this.isLoading.set(false);
      },
    });
  }
}
