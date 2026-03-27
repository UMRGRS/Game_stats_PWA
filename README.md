# Untitled Game Leaderboard

Este proyecto consiste en una Aplicación Web Progresiva (PWA) desarrollada con el framework Angular, que funciona como herramienta complementaria para un videojuego desarrollado en Unity. La aplicación permite a los usuarios visualizar, buscar y ordenar las estadísticas de sus partidas, garantizando el acceso a la información incluso en condiciones de conectividad nula.

## Requisitos
Para el desarrollo y compilación del proyecto, se requiere:

- Node.js >= 24.14.1 y npm >= 11.11.0
```bash
# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash

# in lieu of restarting the shell
\. "$HOME/.nvm/nvm.sh"

# Download and install Node.js:
nvm install 24

# Verify the Node.js version:
node -v # Should print "v24.14.1".

# Verify npm version:
npm -v # Should print "11.11.0".

```

- Angular CLI 
```bash

npm install -g @angular/cli

```

## Instalación y Configuración
- Clonar el repositorio: Descargue los archivos del proyecto a su máquina local.
```bash

git clone https://github.com/UMRGRS/Game_stats_PWA.git

```
- Instalar dependencias: Desde la raíz del proyecto, ejecute el comando:
```bash

npm install

```
## Iniciar el proyecto
```bash

ng serve

```
Navegue a http://localhost:4200/. Nota importante: En el modo de desarrollo (ng serve), el Service Worker no se activa por defecto para facilitar la depuración. Las características offline no estarán disponibles en este modo.
