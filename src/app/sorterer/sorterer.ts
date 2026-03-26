import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SortConfig {
  sortBy: 'score' | 'date';
  ascending: boolean;
}

@Component({
  selector: 'app-sorterer',
  imports: [CommonModule],
  templateUrl: './sorterer.html',
  styleUrl: './sorterer.css',
})
export class Sorterer {
  @Output() sortChange = new EventEmitter<SortConfig>();

  sortBy: 'score' | 'date' = 'score';
  ascending = false; // false = descending, true = ascending

  onSortByChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sortBy = target.value as 'score' | 'date';
    this.ascending = false; // Reset to descending when changing sort field
    this.emitSort();
  }

  toggleSortOrder(): void {
    this.ascending = !this.ascending;
    this.emitSort();
  }

  private emitSort(): void {
    this.sortChange.emit({
      sortBy: this.sortBy,
      ascending: this.ascending
    });
  }

}
