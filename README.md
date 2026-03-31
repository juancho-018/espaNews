# EspaNews: Entretenimiento - Documentación Técnica


# Juan Camilo Meneses Galeano 3144615

Esta aplicación es un explorador de noticias interactivo enfocado en el **Entretenimiento en España**, consumiendo datos de **The News API** (thenewsapi.com). Cumple con los requerimientos de consultar información de un país en específico utilizando múltiples endpoints y flujos de datos.

## Informe de Uso de Endpoints

La aplicación utiliza un total de **6 consultas/endpoints diferentes** para extraer la información. A continuación se detalla cómo se utilizó cada uno:

1. **Top Noticias (`GET /v1/news/top`)**:
   - **Parámetros**: `api_token`, `locale=es`, `categories=entertainment`.
   - **Uso**: Obtiene los titulares más importantes del día relacionados con el entretenimiento en España. Se usa como vista principal por defecto.

2. **Búsqueda General (`GET /v1/news/all`)**:
   - **Parámetros**: `api_token`, `locale=es`, `categories=entertainment`, `search={query}`.
   - **Uso**: Implementa un buscador de texto libre. Filtra todas las noticias de entretenimiento en España basándose en una palabra clave ingresada por el usuario (ej: "Cine", "Música").

3. **Noticia por UUID (`GET /v1/news/uuid/{uuid}`)**:
   - **Parámetros**: `api_token`.
   - **Uso**: Consulta un artículo específico directamente por su identificador único (UUID). Retorna un solo objeto JSON con los detalles crudos de la noticia.

4. **Noticias Similares (`GET /v1/news/similar/{uuid}`)**:
   - **Parámetros**: `api_token`.
   - **Uso**: A partir del UUID de una noticia de interés, este endpoint busca y retorna artículos relacionados semánticamente.

5. **Archivo Histórico (`GET /v1/news/all` con filtro de fecha)**:
   - **Parámetros**: `api_token`, `locale=es`, `categories=entertainment`, `published_on={YYYY-MM-DD}`.
   - **Uso**: Permite acceder a noticias publicadas en una fecha exacta seleccionada a través de un imput tipo `date`.

6. **Filtro por Idioma (`GET /v1/news/all` con filtro de idioma)**:
   - **Parámetros**: `api_token`, `categories=entertainment`, `language={lang}`.
   - **Uso**: Explora el mundo del entretenimiento filtrando explícitamente por el idioma en que fue redactada la noticia (ej: Español, Inglés, Portugués).

---

## Capacidades Implementadas

1. **Menú principal**: Un menú lateral/superior claro con íconos para elegir la consulta a realizar.
2. **Entrada de datos**: Controles dinámicos (inputs de texto, selectores de fecha e idioma) inyectados con JavaScript según la opción del menú seleccionada.
3. **Peticiones a la API**: Conexión robusta asíncrona (`fetch` + `async/await`) pasando dinámicamente el `api_token`.
4. **Procesamiento y Optimización PWA**: Las respuestas JSON son procesadas para extraer título, descripción, fecha de publicación e imágenes. **PWA Avanzado:** Todas las imágenes remotas provenientes de la API son pasadas por un proxy de contenido en tiempo real (`wsrv.nl`) que se encarga de optimizarlas dinámicamente convirtiéndolas al **formato WebP con pérdida controlada** (Calidad 80). Esto aumenta radicalmente la velocidad de carga de la PWA.
5. **Presentación de Resultados**: Tarjetas interactivas en un grid responsivo con estética moderna (Glassmorphism), atributos `loading="lazy"`, tipografías legibles y carga simulada (Skeleton loaders).
6. **Manejo de Errores**: Sistema de alertas (toast) manejando escenarios como: falta de clave API, ID no encontrado (404), timeout de red o búsquedas vacías.
7. **Documentación**: Código completamente comentado explicando el rol de cada bloque lógico.

---

## Capacidades App Progresiva Web (PWA)

El explorador de noticias ha sido convertido a una PWA completa y certificada.

1. **Manifest Web App (`manifest.json`)**: Configura nombre corto, colores del Glassmorphism nativo y referencias a los recursos y su vector principal (`icon.svg`).
2. **Intercepción y Caché (`sw.js`)**: El Service Worker ("Trabajador de Servicio") guarda todos los recursos nucleares de la página (HTML, CSS, JS, Iconos). Esto permite que el marco de la página se cargue ultra rápido incluso con conexiones lentas.
3. **Instalabilidad**: La aplicación se puede instalar como un programa nativo o un acceso directo en dispositivos Android, iOS o escritorios Windows/Mac directamente desde la barra de direcciones del navegador.

> **Enlace y Pruebas**: Para poder instalar la PWA y ver la magia del WebP en tu ordenador, el navegador exige que abras el proyecto mediante un servidor local (ejemplo: `Live Server` en VSCode o ejecutando `npx serve` en tu consola) en `http://localhost:XXXX` o HTTPS. Si la abres dándole doble click, seguirá funcionando, pero el navegador no dejará presionar el botón de "Instalar la Aplicación".

## Entregables

- **Código fuente**: `index.html`, `style.css`, `script.js`, `manifest.json`, `sw.js` e `icon.svg`.
- **Informe**: Este archivo `README.md`.
- **Capturas**: Se pueden obtener abriendo el proyecto plenamente funcional en el browser.
