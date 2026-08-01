import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
  private readonly router = inject(Router);
  private readonly outfitService = inject(OutfitService);

  readonly outfit = signal<Outfit | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly showDeleteConfirmation = signal(false);
  readonly isDeleting = signal(false);

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

  /**
   * Shows a confirmation message before the outfit can be deleted.
   */
  requestDelete(): void {
    this.showDeleteConfirmation.set(true);
  }

  /**
   * Hides the delete confirmation again.
   */
  cancelDelete(): void {
    this.showDeleteConfirmation.set(false);
  }

  /**
   * Deletes the current outfit and redirects back to the outfits overview.
   */
  deleteOutfit(): void {
    const currentOutfit = this.outfit();

    if (!currentOutfit) {
      return;
    }

    this.isDeleting.set(true);
    this.errorMessage.set(null);

    this.outfitService.deleteOutfit(currentOutfit._id).subscribe({
      next: () => {
        void this.router.navigate(['/outfits']);
      },
      error: () => {
        this.errorMessage.set('Outfit could not be deleted.');
        this.isDeleting.set(false);
      },
    });
  }
}
