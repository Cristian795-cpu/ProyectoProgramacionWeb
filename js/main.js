// Variables globales para productos
window.allProducts = [];
window.filteredProducts = [];

document.addEventListener('DOMContentLoaded', () => {

    // Cargar el Carrito y Contadores
    actualizarContadorCarrito();
    actualizarCarritoModal();

    // Cargar todos los productos con la API
    fetch('https://dummyjson.com/products?limit=0')
    .then(res => res.json())
    .then(data => {
        window.allProducts = data.products;
        
        console.log('Productos cargados:', window.allProducts.length);
        // Al inicio, los filtrados son todos los productos
        // ya que es la lista que se manipula con los filtros
        window.filteredProducts = applyProfileFilters(window.allProducts); // se aplican las preferencias si existen        

        // Llamamos a renderGrid para mostrar los productos
        renderGrid();
    })
    .catch(error => console.error('Error al cargar los productos:', error));

    // Cargar Categorias con la API
    fetch('https://dummyjson.com/products/category-list')
    .then(res => res.json())
    .then(data => {
        displayCategories(data);
        console.log('Categorías cargadas:', data);
    })
    .catch(error => console.error('Error al cargar las categorías:', error));

    // Activar el Buscador en la barra
    const searchInput = document.getElementById('searchInput'); 
    if(searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if(e.key === 'Enter') applyFilters(); // Aplicar la funcion de filtros al presionar enter
        });
    }
});

