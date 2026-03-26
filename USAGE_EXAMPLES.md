// USAGE EXAMPLES - Servicios PWA

/**
 * STORAGE SERVICE - IndexedDB Persistence
 * Ubicación: src/app/storage.service.ts
 */

import { StorageService } from './storage.service';

// Inyectar servicio
constructor(private storage: StorageService) {}

// Guardar documentos en IndexedDB
const documents = [
  { id: '1', name: 'Player1', total: 100 },
  { id: '2', name: 'Player2', total: 150 }
];
await this.storage.saveDocuments(documents);

// Recuperar todos los documentos
const allDocs = await this.storage.getDocuments();
console.log(allDocs); // Array de documentos

// Obtener documento específico
const doc = await this.storage.getDocumentById('1');
console.log(doc); // { id: '1', name: 'Player1', ... }

// Verificar si hay datos en IndexedDB
const hasData = await this.storage.hasData();
if (hasData) {
  console.log('Hay datos en caché');
}

// Limpiar IndexedDB
await this.storage.clearDocuments();


/**
 * NETWORK SERVICE - Monitoreo de Conexión y Sincronización
 * Ubicación: src/app/network.service.ts
 */

import { NetworkService } from './network.service';

// Inyectar servicio
constructor(private network: NetworkService) {}

// Obtener estado actual de conexión
const isOnline = this.network.getIsOnline();
console.log(isOnline); // true o false

// Suscribirse a cambios de conexión (en ngOnInit)
this.network.isOnline$.subscribe((isOnline: boolean) => {
  if (isOnline) {
    console.log('Conexión restaurada - sincronizar datos');
    // Llamar a loadDocuments() o similar
  } else {
    console.log('Conexión perdida - usando caché');
  }
});

// Suscribirse a eventos de sincronización
this.network.syncNeeded$.subscribe((needsSync: boolean) => {
  if (needsSync) {
    console.log('Sincronizar datos desde API');
    // Cargar datos nuevamente
  }
});

// Marcar sincronización como completada
this.network.syncCompleted();

// Verificar si necesita sincronizar
const syncing = this.network.getSyncNeeded();


/**
 * ESTRATEGIA COMPLETA EN COMPONENTE
 * (Como implementada en list.component.ts)
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { StorageService } from '../storage.service';
import { NetworkService } from '../network.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-list',
  templateUrl: './list.html'
})
export class ListComponent implements OnInit, OnDestroy {
  documents: any[] = [];
  isOnline: boolean = true;
  isLoading: boolean = true;
  errorMessage: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private storage: StorageService,
    private network: NetworkService,
    private firestore: Firestore
  ) {}

  async ngOnInit() {
    this.isOnline = this.network.getIsOnline();
    
    // Cargar datos iniciales
    await this.loadDocuments();

    // Monitorear cambios de conexión
    this.network.isOnline$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(async (isOnline: boolean) => {
      this.isOnline = isOnline;
      if (isOnline) {
        // Sincronizar cuando se recupera conexión
        await this.loadDocuments();
        this.network.syncCompleted();
      }
    });
  }

  private async loadDocuments(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      // 1. Intentar cargar desde API
      const snapshot = await getDocs(collection(this.firestore, 'scores'));
      
      this.documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // 2. Guardar en IndexedDB para offline
      await this.storage.saveDocuments(this.documents);
      
      this.isLoading = false;

    } catch (error) {
      console.error('Error en API:', error);
      
      // 3. Fallback: cargar desde IndexedDB
      try {
        const cached = await this.storage.getDocuments();
        
        if (cached.length > 0) {
          this.documents = cached;
          this.errorMessage = 'Datos en caché (sin conexión)';
          this.isLoading = false;
        } else {
          this.errorMessage = 'No se pudieron cargar datos';
          this.isLoading = false;
        }
      } catch (cacheError) {
        this.errorMessage = 'Error crítico';
        this.isLoading = false;
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}


/**
 * ACCESIBILIDAD - Atributos en Templates
 */

// Inputs con labels
<label for="search-input">Buscar</label>
<input 
  id="search-input"
  aria-label="Buscar por nombre"
  aria-describedby="search-help"
/>
<span id="search-help" class="sr-only">Ingrese el nombre del jugador</span>

// Tablas accesibles
<table role="table" aria-label="Resultados">
  <thead>
    <tr>
      <th scope="col" role="columnheader">Nombre</th>
      <th scope="col" role="columnheader">Puntos</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td role="cell">Juan</td>
      <td role="cell">100</td>
    </tr>
  </tbody>
</table>

// Botones claros
<button aria-label="Cambiar orden de clasificación">
  <img src="sort.png" alt="Alternar orden"/>
</button>

// Mensajes de estado
<div role="status" aria-live="polite">
  Cargando datos...
</div>

<div role="alert" aria-live="assertive">
  Error: No se pudo conectar a la API
</div>

// Navegación
<nav aria-label="Controles principales">
  <!-- Contenido navegación -->
</nav>

<header role="banner">
  <h1>Título Principal</h1>
</header>

<main role="main">
  <!-- Contenido principal -->
</main>


/**
 * TESTING - Verificar PWA
 */

// En navegador DevTools:

// 1. Service Worker
// DevTools → Application → Service Workers
// Ver: ngsw-worker.js (Active and running)

// 2. Manifest
// DevTools → Application → Manifest
// Ver: name, icons, start_url, display: standalone

// 3. IndexedDB
// DevTools → Storage → IndexedDB → GameStatsPWA → documents
// Ver: documentos almacenados

// 4. Cache Storage
// DevTools → Storage → Cache Storage
// Ver: ngsw:app, ngsw:assets, ngsw:firestore-cache

// 5. Offline
// DevTools → Network → Throttling → Offline
// Recargar página → debe mostrar datos cacheados

// 6. Accesibilidad
// DevTools → Lighthouse → Accessibility
// Verificar score (objetivo: >90)


/**
 * DEPLOYMENT CHECKLIST
 */

// ✓ npm run build --configuration production
// ✓ Service Worker habilitado en ngsw-config.json
// ✓ manifest.webmanifest linked en index.html
// ✓ HTTPS habilitado en servidor
// ✓ Cache-Control headers configurados
// ✓ Icons disponibles (16px a 512px)
// ✓ Accesibilidad validada (Lighthouse)
// ✓ Offline testing completado
// ✓ IndexedDB working en DevTools

