import { Injectable } from '@angular/core';

/**
 * IndexedDB Storage Service
 *
 * Proporciona persistencia de datos en IndexedDB para soporte offline.
 * Gestiona almacenamiento y recuperación de documentos de Firestore.
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private dbName = 'GameStatsPWA';
  private storeName = 'documents';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initializeDB();
  }

  /**
   * Inicializa la base de datos IndexedDB
   */
  private initializeDB(): void {
    if (!('indexedDB' in window)) {
      console.warn('IndexedDB no está disponible en este navegador');
      return;
    }

    const request = window.indexedDB.open(this.dbName, 1);

    request.onerror = () => {
      console.error('Error al abrir IndexedDB:', request.error);
    };

    request.onsuccess = () => {
      this.db = request.result;
      console.log('IndexedDB inicializada correctamente');
    };

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(this.storeName)) {
        const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.createIndex('timestamp', 'dateValue', { unique: false });
        console.log('Object Store creado en IndexedDB');
      }
    };
  }

  /**
   * Guarda un conjunto de documentos en IndexedDB
   * @param documents Array de documentos a guardar
   */
  async saveDocuments(documents: any[]): Promise<void> {
    if (!this.db) {
      console.warn('IndexedDB no está disponible');
      return;
    }

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);

      // Limpiamos los datos anteriores
      objectStore.clear();

      // Agregamos los nuevos datos
      documents.forEach((doc) => {
        objectStore.add(doc);
      });

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          console.log(`${documents.length} documentos guardados en IndexedDB`);
          resolve();
        };
        transaction.onerror = () => {
          console.error('Error al guardar documentos:', transaction.error);
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error('Error en saveDocuments:', error);
    }
  }

  /**
   * Obtiene todos los documentos almacenados en IndexedDB
   * @returns Promise con array de documentos
   */
  async getDocuments(): Promise<any[]> {
    if (!this.db) {
      return [];
    }

    try {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve(request.result);
        };
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error en getDocuments:', error);
      return [];
    }
  }

  /**
   * Obtiene un documento específico por ID
   * @param id ID del documento
   */
  async getDocumentById(id: string): Promise<any> {
    if (!this.db) {
      return null;
    }

    try {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.get(id);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error en getDocumentById:', error);
      return null;
    }
  }

  /**
   * Limpia todos los documentos de IndexedDB
   */
  async clearDocuments(): Promise<void> {
    if (!this.db) {
      return;
    }

    try {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      objectStore.clear();

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          console.log('IndexedDB limpiado');
          resolve();
        };
        transaction.onerror = () => {
          reject(transaction.error);
        };
      });
    } catch (error) {
      console.error('Error en clearDocuments:', error);
    }
  }

  /**
   * Verifica si IndexedDB tiene datos disponibles
   */
  async hasData(): Promise<boolean> {
    const documents = await this.getDocuments();
    return documents.length > 0;
  }
}

