// Variables globales para mantener el estado de todos los filtros
let currentPage = 1;
const productsPerPage = 9;
let currentCategory = '';
let currentSearchTerm = '';
let currentPriceRange = { min: 0, max: Infinity };

// Función para sincronizar inputs móviles con desktop
function syncMobileToDesktop() {
    const searchInput = document.getElementById('searchInput');
    const searchInputMobile = document.getElementById('searchInputMobile');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');
    const minPriceMobile = document.getElementById('minPriceMobile');
    const maxPriceMobile = document.getElementById('maxPriceMobile');
    
    // Sincronizar búsqueda
    if (searchInputMobile && searchInput) {
        searchInput.value = searchInputMobile.value;
    }
    
    // Sincronizar precios
    if (minPriceMobile && minPrice) {
        minPrice.value = minPriceMobile.value;
    }
    
    if (maxPriceMobile && maxPrice) {
        maxPrice.value = maxPriceMobile.value;
    }
}

// Función para obtener valores actuales de los filtros
function getCurrentFilterValues() {
    const searchInput = document.getElementById('searchInput');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    
    // Actualizar búsqueda
    currentSearchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    // Actualizar precio
    if (minPriceInput || maxPriceInput) {
        const min = minPriceInput ? parseFloat(minPriceInput.value) || 0 : 0;
        const max = maxPriceInput ? parseFloat(maxPriceInput.value) || Infinity : Infinity;
        
        // Validar rango de precio
        if (max !== Infinity && max < min) {
            //alert('El precio máximo debe ser mayor o igual al mínimo');
            if (maxPriceInput) maxPriceInput.focus();
            return false; // Indicar que hubo error
        }
        
        currentPriceRange = { min, max };
    }
    
    return true; // Todo ok
}

// Función principal que aplica TODOS los filtros
function applyAllFilters() {
    // Obtener valores actuales
    if (!getCurrentFilterValues()) {
        return; // Hubo error en validación
    }
    
    // Verificar que existan productos
    if (!window.allProducts) {
        console.error('No hay productos cargados');
        return;
    }
    
    console.log('Aplicando filtros:', {
        categoria: currentCategory,
        busqueda: currentSearchTerm,
        precio: currentPriceRange
    });
    
    // Aplicar todos los filtros combinados
    window.filteredProducts = window.allProducts.filter(product => {
        // 1. Filtro por categoría
        const matchCategory = currentCategory === '' || product.category === currentCategory;
        if (!matchCategory) return false;
        
        // 2. Filtro por búsqueda
        const matchSearch = currentSearchTerm === '' ||
                           (product.title && product.title.toLowerCase().includes(currentSearchTerm)) ||
                           (product.description && product.description.toLowerCase().includes(currentSearchTerm));
        if (!matchSearch) return false;
        
        // 3. Filtro por precio
        const matchPrice = product.price >= currentPriceRange.min && 
                          product.price <= currentPriceRange.max;
        if (!matchPrice) return false;
        
        return true; // Producto pasa todos los filtros
    });
    
    console.log('Productos filtrados:', window.filteredProducts.length);
    
    currentPage = 1;
    renderGrid();
}

// Función específica para móvil
function applyMobileFilters() {
    // Primero sincronizar desde móvil a desktop
    syncMobileToDesktop();
    
    // Luego aplicar filtros
    applyAllFilters();
    
    // Cerrar offcanvas después de un pequeño delay (solo en móvil)
    if (window.innerWidth < 992) {
        setTimeout(() => {
            const offcanvasElement = document.getElementById('filtersOffcanvas');
            if (offcanvasElement) {
                const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
                if (offcanvas) {
                    offcanvas.hide();
                }
            }
        }, 500);
    }
}

// Función para filtrar por categoría
function filterByCategory(category) {
    currentCategory = category;
    
    // Actualizar botones activos visualmente
    updateCategoryButtons(category);
    
    // Aplicar filtros
    applyAllFilters();
}

// Función para actualizar botones de categoría
function updateCategoryButtons(selectedCategory) {
    // Actualizar desktop
    document.querySelectorAll('#category-list .category-btn').forEach(btn => {
        const category = btn.getAttribute('data-category') || '';
        if (category === selectedCategory) {
            btn.classList.add('active', 'btn-primary');
            btn.classList.remove('btn-outline-secondary');
        } else {
            btn.classList.remove('active', 'btn-primary');
            btn.classList.add('btn-outline-secondary');
        }
    });
    
    // Actualizar móvil
    document.querySelectorAll('#category-list-mobile .category-btn').forEach(btn => {
        const category = btn.getAttribute('data-category') || '';
        if (category === selectedCategory) {
            btn.classList.add('active', 'btn-primary');
            btn.classList.remove('btn-outline-secondary');
        } else {
            btn.classList.remove('active', 'btn-primary');
            btn.classList.add('btn-outline-secondary');
        }
    });
}

// Función para generar botones de categoría
function generateCategoryButtons(categories) {
    const categoryList = document.getElementById('category-list');
    const categoryListMobile = document.getElementById('category-list-mobile');
    
    if (!categoryList) return;
    
    // Para desktop
    categoryList.innerHTML = categories.map(cat => `
        <li class="mb-1">
            <button class="category-btn btn btn-sm ${cat.id === currentCategory ? 'btn-primary active' : 'btn-outline-secondary'} w-100 text-start" 
                    data-category="${cat.id}"
                    onclick="filterByCategory('${cat.id}')">
                ${cat.name}
            </button>
        </li>
    `).join('');
    
    // Para móvil
    if (categoryListMobile) {
        categoryListMobile.innerHTML = categories.map(cat => `
            <li class="mb-1">
                <button class="category-btn btn btn-sm ${cat.id === currentCategory ? 'btn-primary active' : 'btn-outline-secondary'} w-100 text-start" 
                        data-category="${cat.id}"
                        onclick="filterByCategory('${cat.id}'); setTimeout(() => { const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('filtersOffcanvas')); if(offcanvas) offcanvas.hide(); }, 300);">
                    ${cat.name}
                </button>
            </li>
        `).join('');
    }
}

// Función para limpiar todos los filtros
function clearAllFilters() {
    currentSearchTerm = '';
    currentCategory = '';
    currentPriceRange = { min: 0, max: Infinity };
    
    // Resetear inputs desktop
    const searchInput = document.getElementById('searchInput');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    
    // Resetear inputs móvil
    const searchInputMobile = document.getElementById('searchInputMobile');
    const minPriceMobile = document.getElementById('minPriceMobile');
    const maxPriceMobile = document.getElementById('maxPriceMobile');
    
    if (searchInput) searchInput.value = '';
    if (searchInputMobile) searchInputMobile.value = '';
    if (minPriceInput) minPriceInput.value = '';
    if (maxPriceInput) maxPriceInput.value = '';
    if (minPriceMobile) minPriceMobile.value = '';
    if (maxPriceMobile) maxPriceMobile.value = '';
    
    // Actualizar botones de categoría
    updateCategoryButtons('');
    
    // Aplicar filtros (que ahora no filtrarán nada)
    applyAllFilters();
    
    // Cerrar offcanvas si está abierto
    if (window.innerWidth < 992) {
        const offcanvasElement = document.getElementById('filtersOffcanvas');
        if (offcanvasElement) {
            const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
            if (offcanvas) {
                offcanvas.hide();
            }
        }
    }
}

// Mantener tus funciones existentes
function renderGrid() {
    if (!window.filteredProducts) {
        window.filteredProducts = [...window.allProducts];
    }
    
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const productsToShow = window.filteredProducts.slice(start, end);

    // Asegurar que displayProducts exista
    if (typeof displayProducts === 'function') {
        displayProducts(productsToShow);
    } else {
        console.error('La función displayProducts no está definida');
    }
    
    updatePaginationButtons();
}

function changePage(direction) {
    if (!window.filteredProducts) return;
    
    const totalPages = Math.ceil(window.filteredProducts.length / productsPerPage);
    const newPage = currentPage + direction;

    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderGrid();
        window.scrollTo(0, 0);
    }
}

function updatePaginationButtons() {
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    const pageInfo = document.getElementById('page-info');

    if (pageInfo) pageInfo.innerText = `Página ${currentPage}`;
    
    if (prevBtn) prevBtn.disabled = (currentPage === 1);
    
    const totalPages = Math.ceil(window.filteredProducts.length / productsPerPage);
    if (nextBtn) nextBtn.disabled = (currentPage >= totalPages);
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando filtros...');
    
    // Esperar a que los productos se carguen
    setTimeout(() => {
        if (window.allProducts && window.allProducts.length > 0) {
            console.log('Productos cargados:', window.allProducts.length);
            window.filteredProducts = [...window.allProducts];
            
            // Generar categorías dinámicamente
            const categories = extractCategoriesFromProducts(window.allProducts);
            generateCategoryButtons(categories);
            
            renderGrid();
        } else {
            console.warn('No hay productos cargados aún');
        }
    }, 100);
    
    // Configurar event listeners para desktop
    const searchInput = document.getElementById('searchInput');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    
    // Configurar event listeners para móvil
    const searchInputMobile = document.getElementById('searchInputMobile');
    const minPriceMobile = document.getElementById('minPriceMobile');
    const maxPriceMobile = document.getElementById('maxPriceMobile');
    
    // Búsqueda en tiempo real (desktop)
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => applyAllFilters(), 300);
        });
    }
    
    // Búsqueda en tiempo real (móvil)
    if (searchInputMobile) {
        let searchTimeoutMobile;
        searchInputMobile.addEventListener('input', function() {
            clearTimeout(searchTimeoutMobile);
            searchTimeoutMobile = setTimeout(() => applyMobileFilters(), 300);
        });
    }
    
    // Precio (desktop)
    if (minPriceInput) {
        minPriceInput.addEventListener('change', applyAllFilters);
        minPriceInput.addEventListener('blur', applyAllFilters);
    }
    
    if (maxPriceInput) {
        maxPriceInput.addEventListener('change', applyAllFilters);
        maxPriceInput.addEventListener('blur', applyAllFilters);
    }
    
    // Precio (móvil)
    if (minPriceMobile) {
        minPriceMobile.addEventListener('change', applyMobileFilters);
        minPriceMobile.addEventListener('blur', applyMobileFilters);
    }
    
    if (maxPriceMobile) {
        maxPriceMobile.addEventListener('change', applyMobileFilters);
        maxPriceMobile.addEventListener('blur', applyMobileFilters);
    }
});

// Función auxiliar para extraer categorías de los productos
function extractCategoriesFromProducts(products) {
    if (!products || !Array.isArray(products)) return [];
    
    const categorySet = new Set();
    products.forEach(product => {
        if (product.category) {
            categorySet.add(product.category);
        }
    });
    
    const categories = Array.from(categorySet).map(cat => ({
        id: cat,
        name: cat.charAt(0).toUpperCase() + cat.slice(1)
    }));
    
    // Agregar opción "Todas" al principio
    categories.unshift({ id: '', name: 'Todas' });
    
    return categories;
}