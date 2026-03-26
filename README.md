# GameStatsPwa

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.0.2.

**This is a Progressive Web App (PWA)** with offline support, installable on mobile and desktop, and fully accessible.

## ✨ PWA Features

✅ **Offline Support**: Works without internet connection  
✅ **Installable**: Add to Home Screen on iOS, Android, and desktop  
✅ **Fast**: Service Worker caches app assets and API responses  
✅ **Reliable**: Automatic sync when connection restored  
✅ **Accessible**: WCAG 2.1 AA compliant with semantic HTML and ARIA labels  

For detailed PWA documentation, see [PWA_DOCUMENTATION.md](./PWA_DOCUMENTATION.md)

### Quick PWA Test

1. **Install the app**:
   - Chrome/Edge: Click install button (top right)
   - Firefox: Menu → Install application
   - iOS: Share → Add to Home Screen

2. **Test offline**:
   - DevTools → Network → Throttling → Offline
   - Reload page → Data loads from cache

3. **Check Service Worker**:
   - DevTools → Application → Service Workers
   - Should show: `ngsw-worker.js` active and running

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

### Production Build with Service Worker

To create an optimized production build with Service Worker enabled:

```bash
ng build --configuration production
```

This enables:
- Service Worker registration (`ngsw-worker.js`)
- Cache strategy defined in `ngsw-config.json`
- Asset versioning and cache busting
- Optimized bundle sizes

**Important**: Service Worker requires **HTTPS** in production (except localhost).

## Deployment

### Local Testing

```bash
# Build production version
ng build --configuration production

# Serve with HTTP Server (supports Service Worker locally)
npx http-server dist/game-stats-pwa/browser -p 8080
```

Then navigate to `http://localhost:8080` and test PWA features.

### Deployment Requirements

For full PWA functionality:
- ✅ **HTTPS**: Service Worker requires secure context
- ✅ **Valid manifest.json**: Must be linked in index.html
- ✅ **Icons**: PNG icons in public/icons/ (16px to 512px)
- ✅ **Meta tags**: Viewport, theme-color, apple-mobile-web-app

### Firebase Deployment (if configured)

```bash
npm run build
firebase deploy
```

Ensure Firebase Hosting is configured and SSL certificate is valid.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
