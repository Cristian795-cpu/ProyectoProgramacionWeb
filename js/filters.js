//! Hay que probar esto
let currentPage = 1;
const productsPerPage = 9;
let currentCategory = '';
let currentSearchTerm = '';

function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    currentSearchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    filteredProducts = allProducts.filter(product => {

        const matchCategory = currentCategory === '' || product.category === currentCategory;

        const matchSearch = product.title.toLowerCase().includes(currentSearchTerm) ||
                            product.description.toLowerCase().includes(currentSearchTerm);
         
        // const matchPrice = product.price >= minPrice && product.price <= maxPrice;
        
        return matchCategory && matchSearch; // && matchPrice;
    });

    currentPage = 1; // Reset to first page after applying filters
    renderGrid();
}

function renderGrid() {

    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const productsToShow = filteredProducts.slice(start, end);

    displayProducts(productsToShow);
    updatePaginationButtons();
}

function changePage(direction) {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
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

    if(pageInfo) pageInfo.innerText = `Página ${currentPage}`;
    
    // Deshabilitar "Anterior" si es la pág 1
    if(prevBtn) prevBtn.disabled = (currentPage === 1);
    
    // Deshabilitar "Siguiente" si es la última pág
    const totalPages = Math.ceil(filteredProducts / productsPerPage);
    if(nextBtn) nextBtn.disabled = (currentPage >= totalPages);
}

function filterByCategory(category) {
    currentCategory = category;
    applyFilters();
}



function filterByPrice() {
    const minPriceInput = document.getElementById('minPrice');
    const maxPriceInput = document.getElementById('maxPrice');
    
    const min = minPriceInput ? parseFloat(minPriceInput.value) || 0 : 0;
    const max = maxPriceInput ? parseFloat(maxPriceInput.value) || Infinity : Infinity;
    
    // Validación
    if (max !== Infinity && max < min) {
        alert('El precio máximo debe ser mayor o igual al mínimo');
        if (maxPriceInput) maxPriceInput.focus();
        return;
    }
    
    // Aplicar solo filtro de precio
    currentPriceRange = { min, max };
    
    // Filtrar productos
    filteredProducts = allProducts.filter(product => 
        product.price >= min && product.price <= max
    );
    
    // Si hay otros filtros activos, combinarlos
    if (currentCategory || currentSearchTerm) {
        filteredProducts = filteredProducts.filter(product => {
            const matchCategory = currentCategory === '' || product.category === currentCategory;
            const matchSearch = currentSearchTerm === '' || 
                              product.title.toLowerCase().includes(currentSearchTerm) ||
                              product.description.toLowerCase().includes(currentSearchTerm);
            return matchCategory && matchSearch;
        });
    }
    
    currentPage = 1;
    renderGrid();
    
}
       