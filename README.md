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

> Vercel solo aloja este frontend estático. El backend real (gateway,
> microservicios, MySQL y Elasticsearch) no puede ejecutarse en Vercel; debe
> estar en un VPS/Docker, Render, Railway u otro servicio con persistencia y
> WebSocket.
