window.allProducts = [];
window.filteredProducts = [];
// let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

document.addEventListener('DOMContentLoaded', () => {

    // 1. Cargar el Carrito y Contadores
    actualizarContadorCarrito();
    actualizarCarritoModal();

    // 2. Cargar TODOS los productos
    fetch('https://dummyjson.com/products?limit=0')
    .then(res => res.json())
    .then(data => {
        window.allProducts = data.products;
        
        // Al inicio, los filtrados son TODOS
        window.filteredProducts = window.allProducts; 
        console.log('Productos cargados:', window.allProducts.length);

        // Llamamos a renderGrid (función de filters.js)
        renderGrid();
    })
    .catch(error => console.error('Error al cargar los productos:', error));

    // 3. Cargar Categorías
    fetch('https://dummyjson.com/products/category-list')
    .then(res => res.json())
    .then(data => {
        displayCategories(data);
        console.log('Categorías cargadas:', data);
    })
    .catch(error => console.error('Error al cargar las categorías:', error));

    // 4. Activar el Buscador (Descomentado y corregido)
    const searchInput = document.getElementById('searchInput'); // Asegúrate que el ID en HTML sea 'searchInput'
    if(searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if(e.key === 'Enter') applyFilters(); // Función de filters.js
        });
        // Opcional: Búsqueda en tiempo real mientras escribes
        // searchInput.addEventListener('input', () => applyFilters()); 
    }
});

// window.allProducts = window.allProducts;
// window.filteredProducts = window.filteredProducts;
// window.currentPage = currentPage;
// window.productsPerpage = productsPerPage;
