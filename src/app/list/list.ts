import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { Timestamp } from '@angular/fire/firestore';
import { SearchService } from '../search.service';

export interface SortConfig {
  sortBy: 'score' | 'date';
  ascending: boolean;
}

@Component({
  selector: 'app-list',
  imports: [],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List implements OnInit {
  private firestore = inject(Firestore);
  private searchService = inject(SearchService);

  documents: any[] = [];
  allDocuments: any[] = [];
  currentSort: SortConfig = { sortBy: 'score', ascending: false };

  async ngOnInit() {
    const snapshot = await getDocs(collection(this.firestore, 'scores'));

    this.allDocuments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      formattedDate: this.formatTimestamp(doc.data()['date']),
      dateValue: this.getDateValue(doc.data()['date'])
    }));

    this.documents = this.allDocuments;
    this.applySorting();

    // Subscribe to search term changes
    this.searchService.searchTerm$.subscribe((searchTerm: string) => {
      this.filterDocuments(searchTerm);
    });
  }

  filterDocuments(searchTerm: string): void {
    if (searchTerm.trim() === '') {
      this.documents = this.allDocuments;
    } else {
      this.documents = this.allDocuments.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    this.applySorting();
  }

  onSortChange(config: SortConfig): void {
    this.currentSort = config;
    this.applySorting();
  }

  private applySorting(): void {
    const sorted = [...this.documents];

    if (this.currentSort.sortBy === 'score') {
      sorted.sort((a, b) => {
        const scoreA = parseFloat(a.total) || 0;
        const scoreB = parseFloat(b.total) || 0;
        return this.currentSort.ascending ? scoreA - scoreB : scoreB - scoreA;
      });
    } else if (this.currentSort.sortBy === 'date') {
      sorted.sort((a, b) => {
        const dateA = a.dateValue || 0;
        const dateB = b.dateValue || 0;
        return this.currentSort.ascending ? dateA - dateB : dateB - dateA;
      });
    }

    this.documents = sorted;
  }

  private getDateValue(timestamp: any): number {
    if (!timestamp) return 0;

    if (timestamp instanceof Timestamp) {
      return timestamp.toDate().getTime();
    } else if (timestamp.seconds) {
      return timestamp.seconds * 1000;
    } else if (timestamp instanceof Date) {
      return timestamp.getTime();
    }
    return 0;
  }

  private formatTimestamp(timestamp: any): string {
    if (!timestamp) return '-';

    let date: Date;

    // Handle Firestore Timestamp
    if (timestamp instanceof Timestamp) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      // Handle timestamp object with seconds/nanoseconds
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      return '-';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
  }
}
