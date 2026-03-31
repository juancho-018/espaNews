/**
 * EspaNews - Core Logic (Entretenimiento en España)
 * Implementación de al menos 6 consultas/endpoints diferentes a The News API
 * Tema: Entertainment - País: España
 */

// --- Configuración y Estado ---
const BASE_URL = 'https://api.thenewsapi.com/v1/news';
let API_KEY = 'NW00aEv6eHVR5loVvTbHWan3NPuX4qQb4mlFzFte'; // API Key proporcionada

const state = {
    currentType: 'top', // 'top', 'all', 'uuid', 'similar', 'date', 'language'
    locale: 'es', // País: España (Requerimiento)
    category: 'entertainment', // Tema: Entertainment (Requerimiento)
    loading: false,
    results: [] // Almacena las noticias obtenidas
};

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    // Registro del Service Worker para PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('PWA: Service Worker registrado.', reg.scope))
            .catch(err => console.error('PWA: Error en Service Worker.', err));
    }

    // Inicializar Iconos Lucide
    lucide.createIcons();
    
    setupEventListeners();
    renderContentArea(); // Cargar interfaz inicial
    loadNews(); // Cargar la primera consulta
});

// --- Event Listeners ---
function setupEventListeners() {
    // Manejar el cambio de vista/consulta desde el menú
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const type = e.currentTarget.dataset.type;
            switchView(type, e.currentTarget);
        });
    });
}

// --- Manejo de Vistas ---
function switchView(type, element) {
    // Actualizar clase activa en el menú
    document.querySelector('.menu-item.active').classList.remove('active');
    element.classList.add('active');

    state.currentType = type;
    renderContentArea();
    
    // Solo cargamos automáticamente si no requiere un ID específico (uuid o similar)
    if (type !== 'uuid' && type !== 'similar') {
        loadNews();
    } else {
        renderCards([]); // Limpiar grilla para esperar el input del usuario
    }
}

/**
 * Renderiza los controles dinámicos basados en el endpoint seleccionado.
 * Aquí preparamos la "Entrada de datos" para cada una de las 6 consultas.
 */
function renderContentArea() {
    const title = document.getElementById('current-view-title');
    const desc = document.getElementById('current-view-desc');
    const controls = document.getElementById('dynamic-controls');
    
    // Limpiar controles previos
    controls.innerHTML = '';

    switch(state.currentType) {
        // 1. Endpoint: /top
        case 'top':
            title.innerText = 'Top Noticias';
            desc.innerText = 'Lo más destacado del entretenimiento en España hoy.';
            break;
            
        // 2. Endpoint: /all (Búsqueda por palabra clave)
        case 'all': 
            title.innerText = 'Búsqueda de Entretenimiento';
            desc.innerText = 'Busca noticias de entretenimiento por palabra clave (ES).';
            controls.innerHTML = `
                <input type="text" id="query-search" placeholder="Ej: Cine, Música...">
                <button class="btn-search" onclick="loadNews()"><i data-lucide="search"></i></button>
            `;
            break;

        // 3. Endpoint: /uuid/{id} (Noticia Específica)
        case 'uuid': 
            title.innerText = 'Noticia por UUID';
            desc.innerText = 'Ingresa el ID (UUID) de una noticia para ver sus detalles.';
            controls.innerHTML = `
                <input type="text" id="uuid-search" placeholder="Ej: abc-123-...">
                <button class="btn-search" onclick="loadNews()"><i data-lucide="hash"></i></button>
            `;
            break;

        // 4. Endpoint: /similar/{id} (Noticias Similares)
        case 'similar': 
            title.innerText = 'Noticias Similares';
            desc.innerText = 'Ingresa el ID de una noticia para buscar artículos relacionados.';
            controls.innerHTML = `
                <input type="text" id="similar-search" placeholder="UUID de referencia...">
                <button class="btn-search" onclick="loadNews()"><i data-lucide="copy"></i></button>
            `;
            break;

        // 5. Endpoint: /all (Filtro por fecha)
        case 'date': 
            title.innerText = 'Archivo por Fecha';
            desc.innerText = 'Busca noticias de entretenimiento por fecha (YYYY-MM-DD).';
            const today = new Date().toISOString().split('T')[0];
            controls.innerHTML = `
                <input type="date" id="date-select" max="${today}" value="${today}" onchange="loadNews()">
            `;
            break;

        // 6. Endpoint: /all (Filtro por idioma)
        case 'language': 
            title.innerText = 'Idioma Específico';
            desc.innerText = 'Explora el entretenimiento filtrando por idioma.';
            controls.innerHTML = `
                <select id="language-select" onchange="loadNews()">
                    <option value="es" selected>Español</option>
                    <option value="en">Inglés</option>
                    <option value="pt">Portugués</option>
                </select>
            `;
            break;
    }
    
    lucide.createIcons();
}

/**
 * Función principal para realizar las peticiones a la API.
 * Cubre 6 configuraciones de endpoints/variables.
 */
async function loadNews() {
    if (!API_KEY) {
        showStatus('Falta API Key.', 'warn');
        return;
    }

    setLoading(true);
    
    // Variables por defecto (Siempre enfocado en Entretenimiento y España)
    let url = `${BASE_URL}/all?api_token=${API_KEY}&locale=${state.locale}&categories=${state.category}`;

    // Lógica para estructurar las 6 consultas diferentes ("endpoints")
    switch(state.currentType) {
        // Consulta 1: Endpoint /top
        case 'top':
            url = `${BASE_URL}/top?api_token=${API_KEY}&locale=${state.locale}&categories=${state.category}`;
            break;
            
        // Consulta 2: Endpoint /all con parámetro search
        case 'all':
            const searchEl = document.getElementById('query-search');
            const q = searchEl ? searchEl.value : '';
            url = `${BASE_URL}/all?api_token=${API_KEY}&locale=${state.locale}&categories=${state.category}`;
            if (q) url += `&search=${encodeURIComponent(q)}`;
            break;
            
        // Consulta 3: Endpoint específico /uuid/{uuid}
        case 'uuid':
            const uuidEl = document.getElementById('uuid-search');
            const uuid = uuidEl ? uuidEl.value.trim() : '';
            if(!uuid) { setLoading(false); return; }
            url = `${BASE_URL}/uuid/${encodeURIComponent(uuid)}?api_token=${API_KEY}`;
            break;
            
        // Consulta 4: Endpoint específico /similar/{uuid}
        case 'similar':
            const simEl = document.getElementById('similar-search');
            const simUuid = simEl ? simEl.value.trim() : '';
            if(!simUuid) { setLoading(false); return; }
            url = `${BASE_URL}/similar/${encodeURIComponent(simUuid)}?api_token=${API_KEY}`;
            break;
            
        // Consulta 5: Endpoint /all con parámetro de fecha
        case 'date':
            const dateEl = document.getElementById('date-select');
            const date = dateEl ? dateEl.value : '';
            url = `${BASE_URL}/all?api_token=${API_KEY}&locale=${state.locale}&categories=${state.category}&published_on=${date}`;
            break;
            
        // Consulta 6: Endpoint /all con parámetro de idioma principal
        case 'language':
            const langEl = document.getElementById('language-select');
            const lang = langEl ? langEl.value : 'es';
            url = `${BASE_URL}/all?api_token=${API_KEY}&categories=${state.category}&language=${lang}`;
            break;
    }

    try {
        console.log("Fetching:", url.replace(API_KEY, 'API_KEY_HIDDEN'));
        const response = await fetch(url);
        
        // Manejo de errores de servidor o no encontrado
        if (!response.ok) {
            if (response.status === 404) throw new Error("Recurso no encontrado (404). Verifica el ID ingresado.");
            if (response.status === 401) throw new Error("API Key inválida o no autorizada.");
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();

        // Procesamiento de respuesta
        if (data.error) {
            throw new Error(data.error.message || 'Error reportado por la API');
        }

        // El endpoint /uuid devuelve un solo objeto, los demás devuelven { data: [...] }
        if (state.currentType === 'uuid' && data.uuid) {
            state.results = [data]; // Lo envolvemos en array para reutilizar el renderizado
        } else {
            state.results = data.data || [];
        }

        renderCards();

        if (state.results.length === 0) {
            showStatus('La consulta no arrojó resultados.', 'warn');
        } else {
            showStatus(`Resultados cargados (${state.results.length})`, 'info');
        }
        
    } catch (error) {
        // Manejo robusto de errores
        console.error('API Error:', error);
        state.results = [];
        renderCards();
        showStatus(`Error: ${error.message}`, 'error');
        renderPlaceholder('Hubo un problema al conectar con la API o el ID no existe.');
    } finally {
        setLoading(false);
    }
}

// --- Render Layout & DOM ---

/**
 * Dibuja las tarjetas de noticias en el grid.
 * Extrae y formatea la información JSON (imágenes, fechas, etc.)
 */
function renderCards() {
    const grid = document.getElementById('news-grid');
    grid.innerHTML = '';

    if (state.results.length === 0) {
        if (!state.loading) renderPlaceholder('No hay noticias disponibles o esperando input.');
        return;
    }

    state.results.forEach(article => {
        const card = document.createElement('article');
        card.className = 'news-card';
        
        // Formatear fecha
        const date = new Date(article.published_at).toLocaleDateString('es-ES', {
            day: 'numeric', month: 'short', year: 'numeric'
        });

        // Click on copy UUID
        const uuidCopy = `<button class="uuid-btn" onclick="copyToClipboard('${article.uuid}')" title="Copiar UUID"><i data-lucide="copy"></i> ID</button>`;

        // Optimización PWA a formato WebP con pérdida (q=80) 
        // Usamos un proxy CDN (wsrv.nl) para convertir dinámicamente cualquier imagen de la API
        const rawImageUrl = article.image_url || 'https://images.unsplash.com/photo-1603190287605-e6ade3cb4a00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800';
        const webpOptimizedUrl = `https://wsrv.nl/?url=${encodeURIComponent(rawImageUrl)}&output=webp&q=80&w=400`;

        card.innerHTML = `
            <div class="news-image-container">
                <img src="${webpOptimizedUrl}" alt="${article.title}" class="news-image" loading="lazy" onerror="this.src='https://via.placeholder.com/400x200.webp?text=No+Image'">
            </div>
            <div class="news-content">
                <div class="news-meta-flex">
                    <span class="news-meta">${(article.categories && article.categories.length > 0) ? article.categories[0] : state.category}</span>
                    ${uuidCopy}
                </div>
                <h3>${article.title}</h3>
                <p>${article.description || 'Sin descripción disponible. Haz clic en "Leer más" para conocer la historia completa.'}</p>
                <div class="news-footer">
                    <span class="news-date">${date}</span>
                    <a href="${article.url}" target="_blank" class="read-more">
                        Leer más <i data-lucide="external-link"></i>
                    </a>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
    
    lucide.createIcons();
}

/**
 * Muestra mensaje cuando la grilla está vacía
 */
function renderPlaceholder(msg) {
    const grid = document.getElementById('news-grid');
    grid.innerHTML = `
        <div class="placeholder-msg">
            <i data-lucide="info" style="width: 48px; height: 48px; margin-bottom: 1rem; color: var(--text-muted);"></i>
            <p>${msg}</p>
        </div>
    `;
    lucide.createIcons();
}

/**
 * Controla el estado de carga (skeletons)
 */
function setLoading(isLoading) {
    state.loading = isLoading;
    const grid = document.getElementById('news-grid');
    if (isLoading) {
        grid.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton-card';
            grid.appendChild(skeleton);
        }
    }
}

/**
 * Muestra alertas temporales personalizadas
 */
function showStatus(msg, type = 'info') {
    const status = document.getElementById('status-message');
    status.innerText = msg;
    status.className = `status-message ${type}`;
    status.classList.remove('hidden');
    
    // Ocultar automáticamente después de 4 segundos
    setTimeout(() => {
        status.classList.add('hidden');
    }, 4000);
}

/**
 * Utilidad auxiliar para copiar UUID
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showStatus('UUID copiado al portapapeles', 'info');
    }).catch(err => {
        console.error('Error copiando:', err);
    });
}
