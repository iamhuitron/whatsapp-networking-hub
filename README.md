# WhatsApp Networking Hub

Convierte el chat de tu comunidad de WhatsApp en un directorio de networking profesional — **sin servidores, sin cuentas, sin subir tus datos a ningún lado.**

## Qué es

Una aplicación web para grupos de WhatsApp (comunidades, cohortes, meetups) que transforma los mensajes donde la gente comparte su carrera, universidad, trabajo, ciudad y redes sociales en un directorio buscable, para facilitar hacer networking real dentro del grupo.

## Cómo funciona

1. Exportas el chat de WhatsApp como `.txt` desde tu teléfono.
2. Abres esta web y cargas el archivo (drag & drop o selector).
3. El navegador lee y analiza el archivo **en memoria, localmente**.
4. Seleccionas cuál participante eres tú.
5. Navegas el directorio, buscas personas, y abres sus perfiles de Instagram/LinkedIn con un clic.
6. Marcas con quién ya hiciste networking. Tu progreso se guarda en tu navegador.

## Privacidad

**Tu archivo de WhatsApp se procesa completamente en tu navegador. Nunca se sube a ningún servidor.**

Detalles técnicos:

- El `.txt` se lee con la File API / `FileReader` del navegador — no hay `fetch()`, `XMLHttpRequest` ni `FormData` que lo envíen a ningún lado.
- No hay backend, API propia, base de datos remota, ni funciones serverless que procesen datos personales.
- No hay analytics, telemetría ni trackers de ningún tipo.
- Los datos (perfiles, tu progreso de networking) se guardan únicamente en **IndexedDB** / `localStorage` de tu navegador. Puedes borrarlos en cualquier momento desde Ajustes → "Eliminar todos mis datos".
- El único tráfico de red que generas al usar la app son las páginas que tú decides abrir manualmente (el perfil de Instagram o LinkedIn de alguien) — la app nunca visita esos sitios por ti ni hace scraping.
- La aplicación no infiere datos: solo usa lo que está escrito explícitamente en el chat o lo que tú mismo escribes en tu perfil. Si algo no aparece, se muestra como "No especificado".

## Cómo exportar tu chat de WhatsApp

1. Abre el chat o grupo en WhatsApp.
2. Toca el nombre del grupo → **Más opciones (⋮)** → **Más** → **Exportar chat**.
3. Elige **Sin archivos multimedia**.
4. Guarda el `.txt` resultante en tu dispositivo.

## Cómo usar la herramienta

1. Abre la URL de la app desplegada (o corre el proyecto localmente, ver abajo).
2. Sube tu `.txt` exportado.
3. Selecciona tu nombre en la lista de participantes detectados.
4. Revisa/edita tu propio perfil.
5. Explora el directorio, usa el buscador y los filtros, o entra a "Networking Session" para revisar contactos uno por uno.
6. Exporta tus resultados (CSV/XLSX) cuando quieras.

## Cómo ejecutar localmente

Requiere Node.js 18+.

```bash
git clone https://github.com/<tu-usuario>/whatsapp-networking-hub.git
cd whatsapp-networking-hub
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Otros comandos útiles:

```bash
npm run lint       # ESLint
npm run typecheck  # TypeScript sin emitir archivos
npm run test       # Vitest
npm run build       # Build de producción (export estático)
```

## Cómo desplegar en Vercel

1. Haz fork o importa este repositorio en [vercel.com/new](https://vercel.com/new).
2. Vercel detecta Next.js automáticamente. No se requiere configurar variables de entorno ni bases de datos.
3. Deploy. Listo — la URL resultante sirve la app estática generada por `next build` (`output: "export"`).

## Cómo desplegar en GitHub Pages

El proyecto está configurado con `output: "export"` en `next.config.ts`, por lo que genera un sitio 100% estático en `/out`, compatible con GitHub Pages.

1. En **Settings → Pages** del repositorio, selecciona la fuente **GitHub Actions**.
2. El workflow incluido en `.github/workflows/deploy-pages.yml` construye el sitio y lo publica automáticamente en cada push a `main`.
3. Si el repositorio se sirve desde una subruta (`https://usuario.github.io/whatsapp-networking-hub/`), el workflow define automáticamente `NEXT_PUBLIC_BASE_PATH` para que las rutas internas funcionen correctamente.

## Cómo contribuir

1. Haz fork del repositorio y crea una rama descriptiva (`feat/parser-linkedin`, `fix/deduplicacion`).
2. Corre `npm run lint`, `npm run typecheck` y `npm run test` antes de abrir el PR.
3. **Nunca** incluyas archivos `.txt` reales de chats, nombres reales, ni perfiles sociales reales en commits o PRs. Usa los fixtures anonimizados en `tests/fixtures/`.
4. Describe claramente qué problema resuelve tu cambio y cómo lo probaste.

## Estado del proyecto

El proyecto se desarrolla por fases (ver `CONTRIBUTING` / issues del repo). El parser definitivo de WhatsApp (`lib/parser/whatsapp-parser.ts`) se implementa a partir del análisis de exports reales anonimizados, y aún no está completo en esta versión inicial.

## Licencia

MIT — ver [LICENSE](./LICENSE).
