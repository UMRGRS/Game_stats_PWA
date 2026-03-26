# Game Stats PWA - Documentación

Este documento detalla la implementación de los requisitos PWA en la aplicación Angular.

## ✅ Requisitos Implementados

### 1. Estructura PWA
- ✅ **manifest.webmanifest**: Configurado con metadatos completos
  - Nombre: "Untitled Game Leaderboard"
  - Display mode: `standalone` (instalable como app nativa)
  - Íconos: Disponibles en múltiples tamaños (16x16 hasta 512x512)
  - Orientación: portrait-primary
  - Colores: Theme color (#1976d2)
  
- ✅ **Service Worker**: Registrado automáticamente
  - Configuración: `@angular/service-worker` v20.0.0
  - Archivo: `ngsw-worker.js`
  - Registro automático cuando está estable (30 segundos)
  - Solo activado en producción (`!isDevMode()`)

### 2. Instalabilidad (A2HS - Add to Home Screen)
- ✅ Metadatos PWA completos en `index.html`
- ✅ Manifest vinculado correctamente
- ✅ Apple mobile web app capable: `true`
- ✅ Icono de toque para iOS: 192x192
- ✅ Nombre para iOS
- ✅ Color de tema para navegadores
- ✅ Browserconfig.xml para Windows

### 3. Offline Básico
- ✅ **Service Worker Caching Strategy**:
  - **App assets**: Prefetch (descargan al instalar)
  - **Assets estáticos**: Lazy + prefetch update
  - **Firestore API**: Freshness strategy (red primero, fallback a cache)
  
- ✅ **Caché de Firestore**:
  - URL patterns: `https://firestore.googleapis.com/**`
  - Estrategia: Freshness (intenta red, si falla usa cache)
  - TTL: 24 horas
  - Timeout: 10 segundos
  - Max size: 100 entradas

### 4. Persistencia de Datos

#### IndexedDB Storage Service
**Archivo**: `src/app/storage.service.ts`

Proporciona una capa de abstracción para persistencia local:

```typescript
- saveDocuments(documents): Guarda array de documentos
- getDocuments(): Recupera todos los documentos
- getDocumentById(id): Obtiene documento específico
- clearDocuments(): Limpia la DB
- hasData(): Verifica si hay datos
```

**Base de datos**: `GameStatsPWA`
**Object Store**: `documents` (con índices por name y timestamp)

#### Almacenamiento en Caché del Service Worker
El Service Worker cachea automáticamente:
- HTML, CSS, JavaScript de la app
- Respuestas de API Firestore (24h TTL)

### 5. Consumo de API Remota con Manejo de Errores

**Archivo**: `src/app/list/list.ts`

Estrategia de obtención de datos con fallback:

```typescript
1. Intenta cargar desde Firestore (API remota)
2. Si API responde:
   - Mapea documentos
   - Formatea timestamps
   - Guarda en IndexedDB para offline
   - Muestra datos

3. Si API falla (error de red):
   - Intenta recuperar desde IndexedDB
   - Si hay datos en caché: muestra con aviso "Datos desde caché"
   - Si NO hay datos en caché: muestra error
```

**Manejo de errores**:
```typescript
- errorMessage: string (mostrado al usuario)
- isLoading: boolean (indicador de carga)
- isOnline: boolean (estado de conexión)
```

**Indicadores visuales**:
- 🟡 "Cargando datos..." (durante fetch)
- 🔴 "Datos mostrados desde caché (sin conexión)"
- 🔴 "Error: No se pudieron cargar los datos"

### 6. Estrategia de Sincronización

**Archivo**: `src/app/network.service.ts`

#### Descripción General
La PWA implementa una **estrategia de sincronización offline-first con reintento manual**:

#### Flujo de Sincronización

```
┌─────────────────────────────────────────────────────────┐
│                    APP INICIADA                         │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Intentar cargar desde API (Firestore)│
        └──────────────────────────────────────┘
                    │              │
          ÉXITO     │              │  ERROR
                    ▼              ▼
            ┌──────────────┐  ┌────────────────────┐
            │ Guardar en   │  │ Cargar desde       │
            │ IndexedDB    │  │ IndexedDB (caché)  │
            └──────────────┘  └────────────────────┘
                    │                   │
                    └───────────────────┘
                           │
                           ▼
            ┌──────────────────────────────────┐
            │ Mostrar datos + estado de conexión
            └──────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Monitorear evento 'online' del nav.  │
        └──────────────────────────────────────┘
                           │
                    SE RECUPERA CONEXIÓN
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │ Emitir syncNeeded$ = true            │
        │ Recargar datos desde API             │
        └──────────────────────────────────────┘
                    │              │
          ÉXITO     │              │  ERROR
                    ▼              ▼
         ACTUALIZAR         MANTENER DATOS
         IndexedDB          DE CACHÉ
```

#### Componentes

1. **NetworkService** (`network.service.ts`)
   - Monitorea eventos `online`/`offline` del navegador
   - Emite observables: `isOnline$` y `syncNeeded$`
   - Proporciona métodos: `getIsOnline()`, `syncCompleted()`

2. **List Component** (`list/list.ts`)
   - Se suscribe a `networkService.isOnline$`
   - Cuando se recupera conexión, llama a `loadDocuments()`
   - Usa `takeUntil()` para cleanup

3. **StorageService** (`storage.service.ts`)
   - Persiste datos en IndexedDB
   - Proporciona fallback cuando API falla

#### Ventajas de esta Estrategia

✅ **Simple**: No requiere Background Sync API (compatible con más navegadores)
✅ **Automática**: Se sincroniza cuando se recupera la conexión
✅ **Transparente**: Usuario ve si está offline con indicadores visuales
✅ **Robusta**: Fallback en múltiples niveles (API → Service Worker cache → IndexedDB)
✅ **Documentada**: Código con comentarios claros

#### Limitaciones y Consideraciones

⚠️ No sincroniza datos pendientes del usuario (POST/PUT)
⚠️ Solo maneja lectura de datos (GET)
⚠️ Sincronización manual al reconectar (no background sync)

**Para mejorar**: Implementar `registerSyncEvent()` si el navegador soporta Background Sync API

### 7. Accesibilidad Mínima (WCAG 2.1 AA)

#### Etiquetas Semánticas

**HTML Semántico**:
```html
<header role="banner">           <!-- Encabezado principal -->
<main role="main">               <!-- Contenido principal -->
<nav aria-label="...">           <!-- Navegación con label -->
<section aria-labelledby="id">   <!-- Secciones con heading -->
<table role="table">             <!-- Tabla accesible -->
  <thead>
    <th role="columnheader">     <!-- Headers de columna -->
```

**Formularios Accesibles**:
```html
<label for="search-input">Buscar jugador</label>
<input id="search-input" aria-label="..." aria-describedby="...">
```

**Botones y Controles**:
```html
<button aria-label="Descripción clara de acción">
  <img alt="Texto alternativo para imagen"/>
</button>
```

#### ARIA Attributes

| Atributo | Uso | Dónde |
|----------|-----|-------|
| `aria-label` | Etiqueta para screen readers | Botones, inputs, iconos |
| `aria-labelledby` | Vincula a encabezado | Select, inputs |
| `aria-describedby` | Descripción adicional | Inputs, forms |
| `aria-live="polite"` | Contenido dinámico | Mensajes de estado |
| `aria-live="assertive"` | Errores críticos | Mensajes de error |
| `aria-hidden="true"` | Oculta de screen readers | Decorativos |
| `role="..."` | Define tipo de elemento | Divs estilizados |

#### Clases de Accesibilidad

**`.sr-only`** (Screen Reader Only):
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
}
```

Oculta visualmente pero mantiene accesible para lectores de pantalla.

#### Componentes Accesibles

1. **Searchbar** (`searchbar/searchbar.html`)
   - Label asociado con `for/id`
   - `aria-label` + `aria-describedby`
   - Forma semántica con `role="search"`

2. **Dark Switch** (`dark-switch/dark-switch.html`)
   - `aria-label` descriptivo
   - `aria-describedby` con estado actual
   - Emojis para mejor UX

3. **Sorterer** (`sorterer/sorterer.html`)
   - `aria-labelledby` para select
   - Botón con `aria-label` dinámico
   - Textos descriptivos en `.sr-only`

4. **List** (`list/list.html`)
   - Table semántica con `<thead>` y `<tbody>`
   - `<th role="columnheader" scope="col">`
   - Mensajes de estado con `role="status"` y `aria-live`
   - Indicador de carga accesible

## 📋 Archivos Modificados

### Nuevos Archivos
- `src/app/storage.service.ts` - IndexedDB storage
- `src/app/network.service.ts` - Network monitoring y sync strategy
- `PWA_DOCUMENTATION.md` - Este archivo

### Archivos Modificados
- `ngsw-config.json` - Agregado dataGroups para Firestore caching
- `src/app/list/list.ts` - Manejo de errores, offline support, storage
- `src/app/list/list.html` - Accesibilidad, estados
- `src/app/list/list.css` - Estilos para mensajes de estado
- `src/app/searchbar/searchbar.html` - Accesibilidad
- `src/app/dark-switch/dark-switch.html` - Accesibilidad mejorada
- `src/app/sorterer/sorterer.html` - Accesibilidad
- `src/app/app.html` - Estructura semántica
- `src/styles.css` - Clase `.sr-only`

## 🧪 Testing de Requisitos

### Para verificar que todo funciona:

1. **Service Worker**:
   ```bash
   # Build production
   npm run build
   
   # Abrir DevTools → Application → Service Workers
   # Debe mostrar: ngsw-worker.js active and running
   ```

2. **Manifest.json**:
   ```bash
   # En DevTools → Application → Manifest
   # Verificar:
   - name, short_name
   - start_url, scope
   - display: standalone
   - icons con sizes correctos
   ```

3. **Instalabilidad (A2HS)**:
   - En Chrome: Click en icono de descarga (arriba derecha)
   - En Firefox: Menú → Instalar aplicación
   - En iOS Safari: Compartir → Agregar a pantalla de inicio

4. **Offline**:
   ```bash
   # DevTools → Network → Throttling → Offline
   # Recargar página → Debe mostrar datos cacheados
   ```

5. **IndexedDB**:
   ```bash
   # DevTools → Storage → IndexedDB → GameStatsPWA → documents
   # Verificar documentos guardados
   ```

6. **Accesibilidad**:
   ```bash
   # DevTools → Lighthouse → Accessibility
   # Debe pasar las pruebas de accesibilidad
   
   # O usar: axe DevTools Chrome extension
   ```

## 📱 Características PWA

### Ventajas Implementadas

✅ **Instalable**: Se puede instalar como aplicación nativa
✅ **Offline First**: Funciona sin internet con datos cacheados
✅ **Persistente**: IndexedDB mantiene datos entre sesiones
✅ **Rápida**: Assets cacheados = carga instantánea
✅ **Confiable**: Sync automático al reconectar
✅ **Accesible**: Compatible con lectores de pantalla
✅ **Responsive**: Funciona en cualquier dispositivo
✅ **Segura**: HTTPS (requerido para SW)

### Performance

- Tamaño caché app: ~5-10MB (configurable)
- Firestore cache TTL: 24 horas
- Timeout de red: 10 segundos
- Datos IndexedDB: Ilimitado (hasta límite del navegador)

## 🔧 Configuración

### Variables de Entorno
Editar `env/environment.ts` para Firebase config.

### Caché Strategy
Editar `ngsw-config.json`:
- `maxAge`: Duración del caché
- `timeout`: Espera máxima a red
- `strategy`: "freshness" (red primero) o "performance" (cache primero)

### Storage
Editar `storage.service.ts`:
- Nombre de DB: `GameStatsPWA`
- Store name: `documents`
- Índices: `name`, `timestamp`

## 📚 Referencias

- [Angular Service Worker](https://angular.io/guide/service-worker-intro)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [WCAG 2.1 Accessibility](https://www.w3.org/WAI/WCAG21/quickref/)
- [PWA Checklist](https://web.dev/pwa-checklist/)

---

**Versión PWA**: 1.0  
**Angular Version**: 20.0.0  
**Service Worker**: @angular/service-worker 20.0.0  
**Última actualización**: 2026-03-25

