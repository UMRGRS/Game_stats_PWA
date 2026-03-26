import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { Timestamp } from '@angular/fire/firestore';
import { SearchService } from '../search.service';
import { StorageService } from '../storage.service';
import { NetworkService } from '../network.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
export class List implements OnInit, OnDestroy {
  private firestore = inject(Firestore);
  private searchService = inject(SearchService);
  private storageService = inject(StorageService);
  private networkService = inject(NetworkService);
  private destroy$ = new Subject<void>();

  documents: any[] = [];
  allDocuments: any[] = [];
  currentSort: SortConfig = { sortBy: 'score', ascending: false };
  isOnline: boolean = true;
  isLoading: boolean = true;
  errorMessage: string = '';

  async ngOnInit() {
    this.isOnline = this.networkService.getIsOnline();

    // Cargar datos iniciales
    await this.loadDocuments();

    // Suscribirse a cambios de conexión de red
    this.networkService.isOnline$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(async (isOnline: boolean) => {
      this.isOnline = isOnline;
      if (isOnline) {
        // Sincronizar datos cuando se recupera la conexión
        console.log('Conexión restaurada, sincronizando datos...');
        await this.loadDocuments();
        this.networkService.syncCompleted();
      }
    });

    // Subscribe to search term changes
    this.searchService.searchTerm$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((searchTerm: string) => {
      this.filterDocuments(searchTerm);
    });
  }

  /**
   * Carga documentos desde API, con fallback a IndexedDB en caso de error
   */
  private async loadDocuments(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Intentar cargar desde Firestore
      const snapshot = await getDocs(collection(this.firestore, 'scores'));

      this.allDocuments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        formattedDate: this.formatTimestamp(doc.data()['date']),
        dateValue: this.getDateValue(doc.data()['date'])
      }));

      // Guardar en IndexedDB para offline
      await this.storageService.saveDocuments(this.allDocuments);
      this.documents = this.allDocuments;
      this.applySorting();
      this.isLoading = false;

    } catch (error: any) {
      console.error('Error cargando desde Firestore:', error);

      // Fallback: cargar desde IndexedDB
      try {
        const cachedDocuments = await this.storageService.getDocuments();

        if (cachedDocuments.length > 0) {
          this.allDocuments = cachedDocuments;
          this.documents = this.allDocuments;
          this.applySorting();
          this.errorMessage = 'Datos mostrados desde caché (sin conexión)';
          this.isLoading = false;
        } else {
          // Sin datos en caché
          this.errorMessage = 'No se pudieron cargar los datos. Sin conexión a internet y sin caché disponible.';
          this.documents = [];
          this.allDocuments = [];
          this.isLoading = false;
        }
      } catch (cacheError) {
        console.error('Error cargando desde caché:', cacheError);
        this.errorMessage = 'Error al cargar datos. Por favor, recarga la página.';
        this.isLoading = false;
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
