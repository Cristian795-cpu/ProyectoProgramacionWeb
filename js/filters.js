// Variables globales para mantener el estado de todos los filtros
let currentPage = 1;
const productsPerPage = 9;
let currentCategory = '';
let currentSearchTerm = '';
let currentPriceRange = { min: 0, max: Infinity };

// Función principal que aplica TODOS los filtros
function applyAllFilters() {
    const searchInput = document.getElementById('searchInput');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    
    // Actualizar estado de búsqueda
    currentSearchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    // Actualizar estado de precio (si hay inputs visibles)
    if (minPriceInput || maxPriceInput) {
        const min = minPriceInput ? parseFloat(minPriceInput.value) || 0 : 0;
        const max = maxPriceInput ? parseFloat(maxPriceInput.value) || Infinity : Infinity;
        
        // Validar rango de precio
        if (max !== Infinity && max < min) {
            //alert('El precio máximo debe ser mayor o igual al mínimo');
            if (maxPriceInput) maxPriceInput.focus();
            return;
        }
        
        currentPriceRange = { min, max };
    }
    
    // Aplicar todos los filtros combinados
    window.filteredProducts = window.allProducts.filter(product => {
        // 1. Filtro por categoría
        const matchCategory = currentCategory === '' || product.category === currentCategory;
        if (!matchCategory) return false;
        
        // 2. Filtro por búsqueda
        const matchSearch = currentSearchTerm === '' ||
                           product.title.toLowerCase().includes(currentSearchTerm) ||
                           product.description.toLowerCase().includes(currentSearchTerm);
        if (!matchSearch) return false;
        
        // 3. Filtro por precio
        const matchPrice = product.price >= currentPriceRange.min && 
                          product.price <= currentPriceRange.max;
        if (!matchPrice) return false;
        
        return true; // Producto pasa todos los filtros
    });
    
    currentPage = 1;
    renderGrid();
}

// Función para filtrar por categoría
function filterByCategory(category) {
    currentCategory = category;
    applyAllFilters(); // Usar la función unificada
}

// Función para filtrar solo por precio (opcional, si quieres mantenerla)
function filterByPrice() {
    // Ahora solo llama a applyAllFilters que maneja todos los filtros
    applyAllFilters();
}

// Mantener tu función renderGrid sin cambios
function renderGrid() {
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const productsToShow = window.filteredProducts.slice(start, end);

    displayProducts(productsToShow);
    updatePaginationButtons();
}

// Mantener tu función changePage sin cambios
function changePage(direction) {
    const totalPages = Math.ceil(window.filteredProducts.length / productsPerPage);
    const newPage = currentPage + direction;

    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderGrid();
        window.scrollTo(0, 0);
    }
}

// Mantener tu función updatePaginationButtons sin cambios
function updatePaginationButtons() {
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');
    const pageInfo = document.getElementById('page-info');

    if(pageInfo) pageInfo.innerText = `Página ${currentPage}`;
    
    if(prevBtn) prevBtn.disabled = (currentPage === 1);
    
    const totalPages = Math.ceil(window.filteredProducts.length / productsPerPage);
    if(nextBtn) nextBtn.disabled = (currentPage >= totalPages);
}

// Función para limpiar todos los filtros
function clearAllFilters() {
    currentSearchTerm = '';
    currentCategory = '';
    currentPriceRange = { min: 0, max: Infinity };
    
    
    const searchInput = document.getElementById('searchInput');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    
    if (searchInput) searchInput.value = '';
    if (minPriceInput) minPriceInput.value = '';
    if (maxPriceInput) maxPriceInput.value = '';
    
    
    document.querySelectorAll('.category-btn.active').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Aplicar filtros (que ahora no filtrarán nada)
    applyAllFilters();
}

// 
document.addEventListener('DOMContentLoaded', function() {
    
    if (window.allProducts) {
        window.filteredProducts = [...window.allProducts];
        renderGrid();
    }
    
    
    const searchInput = document.getElementById('searchInput');
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    
    
    if (searchInput) {
        
        searchInput.addEventListener('input', function() {
            
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => applyAllFilters(), 300);
        });
    }
    
    
    if (minPriceInput) {
        minPriceInput.addEventListener('change', applyAllFilters);
        minPriceInput.addEventListener('blur', applyAllFilters);
    }
    
    if (maxPriceInput) {
        maxPriceInput.addEventListener('change', applyAllFilters);
        maxPriceInput.addEventListener('blur', applyAllFilters);
    }
    
    
});
