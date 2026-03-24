import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { SearchService } from '../search.service';

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

  async ngOnInit() {
    const snapshot = await getDocs(collection(this.firestore, 'scores'));

    this.allDocuments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    this.documents = this.allDocuments;

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
  }
}
