# Frontend — UAJS Smart Campus

React + Vite para la plataforma Smart Campus UAJS.

Requiere **Node.js 22 LTS** (ver `.nvmrc`).

## Desarrollo local

```bash
npm install
npm run dev
```

El proxy de Vite envía `/api` y `/socket.io` a `http://localhost:3000`
(el gateway del backend en Docker).

## Build

```bash
npm run build
npm run preview
```

## Cabeceras de seguridad y CSP

`vercel.json` envía cabeceras de seguridad en todas las rutas, incluida una
**Content-Security-Policy** con hashes SHA-256 de los dos bloques inline de
`index.html` (el `<style>` del splash de carga y el `<script>` que aplica el
tema). Los hashes corresponden al CSS ya minificado que Vite emite en
`dist/index.html`, no al fuente.

Si editas cualquiera de esos dos bloques, recalcula los hashes o el navegador
bloqueará el splash/tema (la app sigue funcionando, solo pierde ese estilo):

```bash
npm run build
npm run csp:hashes
```

Pega los valores en `vercel.json` → `headers` → `Content-Security-Policy`
(`script-src` y `style-src`). La directiva `connect-src` también lista el
origen del backend (`https://backend-8pq5.onrender.com`): si cambia la URL de
`VITE_API_URL` o `VITE_WS_URL`, actualízala ahí. El script nunca usa
`'unsafe-inline'` ni `'unsafe-eval'`, y el backend no envía CSP porque solo
devuelve JSON (helmet la deja desactivada a propósito).

## Despliegue en Vercel

1. Importa el repositorio `UNIAJS-Smart-Campus/frontend` en Vercel.
2. Vercel detecta Vite; `vercel.json` ya define build, `dist`, las rutas SPA
   (`BrowserRouter`) y las cabeceras de seguridad.
3. Configura las variables de entorno del proyecto:
   - `VITE_API_URL`: URL absoluta del gateway con HTTPS, terminando en `/api`.
     Ejemplo: `https://api.tu-dominio.com/api`.
   - `VITE_WS_URL` (opcional): URL del backend con WebSocket.
     Ejemplo: `https://api.tu-dominio.com`. Si se omite, el cliente no abre
     Socket.IO y la app sigue funcionando con REST.
4. En el backend, agrega el dominio de Vercel a `CORS_ORIGINS` (incluye también
   los dominios de preview si los vas a usar).
5. Vuelve a desplegar después de cambiar variables de entorno.

La autenticación usa cookies HttpOnly para los tokens. En producción el backend
debe usar HTTPS, `COOKIE_SECURE=1`, `SameSite=None` y
`Access-Control-Allow-Credentials: true`; además, el origen exacto del frontend
debe estar en `CORS_ORIGINS`. Tras cambiar estas variables hay que reconstruir y
redesplegar el frontend.

> Vercel solo aloja este frontend estático. El backend real (gateway,
> microservicios, MySQL y Elasticsearch) no puede ejecutarse en Vercel; debe
> estar en un VPS/Docker, Render, Railway u otro servicio con persistencia y
> WebSocket.

## Autores y colaboradores

- [ValeriaOsp](https://github.com/ValeriaOsp)
- [Greys1512](https://github.com/Greys1512)
- [felipeguevaram3-collab](https://github.com/felipeguevaram3-collab)
