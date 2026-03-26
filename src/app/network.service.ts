import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Network & Synchronization Service
 *
 * Monitorea el estado de la conexión de red y coordina la sincronización
 * de datos cuando se recupera la conexión.
 *
 * ESTRATEGIA DE SINCRONIZACIÓN:
 * 1. Monitor: Escucha eventos online/offline del navegador
 * 2. Almacenamiento: Los datos se persisten en IndexedDB
 * 3. Sincronización Manual: Cuando se reconecta, se recarga desde API
 * 4. Fallback: Si API falla, se usan datos en caché de IndexedDB
 * 5. Notificación: Se emiten eventos para que componentes actualicen UI
 */
@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  isOnline$ = this.isOnlineSubject.asObservable();

  private syncNeededSubject = new BehaviorSubject<boolean>(false);
  syncNeeded$ = this.syncNeededSubject.asObservable();

  constructor() {
    this.initializeNetworkListeners();
  }

  /**
   * Inicializa listeners para eventos de conexión de red
   */
  private initializeNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('Conexión restaurada');
      this.isOnlineSubject.next(true);
      this.syncNeededSubject.next(true);
    });

    window.addEventListener('offline', () => {
      console.log('Conexión perdida');
      this.isOnlineSubject.next(false);
    });
  }

  /**
   * Obtiene el estado actual de conexión
   */
  getIsOnline(): boolean {
    return this.isOnlineSubject.value;
  }

  /**
   * Marca que la sincronización ha sido completada
   */
  syncCompleted(): void {
    this.syncNeededSubject.next(false);
  }

  /**
   * Obtiene el estado actual de sincronización pendiente
   */
  getSyncNeeded(): boolean {
    return this.syncNeededSubject.value;
  }
}

/**
 * DOCUMENTACIÓN DE ESTRATEGIA DE SINCRONIZACIÓN
 *
 * La PWA implementa una estrategia de sincronización offline-first con soporte manual:
 *
 * 1. CACHÉ EN TIEMPO REAL:
 *    - Cuando la app carga datos desde Firestore, los guarda en IndexedDB
 *    - El Service Worker también cachea las respuestas HTTP con estrategia "freshness"
 *    - Esto permite que los datos estén disponibles incluso sin conexión
 *
 * 2. DETECCIÓN DE DESCONEXIÓN:
 *    - NetworkService monitorea eventos online/offline del navegador
 *    - Emite observables para que componentes reaccionen
 *
 * 3. SINCRONIZACIÓN EN RECONEXIÓN:
 *    - Cuando se recupera la conexión, se emite syncNeeded$ = true
 *    - Los componentes subscritos (como List) recargan datos desde API
 *    - Si API responde, se actualizan datos en IndexedDB
 *    - Si API falla, se mantienen datos del caché en IndexedDB
 *
 * 4. MANEJO DE ERRORES:
 *    - list.ts intenta cargar de API primero
 *    - Si hay error, fallback a IndexedDB
 *    - Se muestra mensaje al usuario indicando modo offline
 *
 * 5. VENTAJAS DE ESTA ESTRATEGIA:
 *    - Simple de implementar (sin dependencias adicionales)
 *    - Compatible con la mayoría de navegadores
 *    - Proporciona UX consistente con datos siempre disponibles
 *    - Reduce carga en servidor al cachear agresivamente
 */

