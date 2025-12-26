

// fetch('https://dummyjson.com/products')
// .then(res => res.json())
// .then(console.log);

// fetch('https://dummyjson.com/products/categories')
// .then(res => res.json())
// .then(console.log);



 let productsData = [];
 let categoriesData = [];
 let tallaData = [];


 let currentPage = 1;
const productsPerPage = 9;
let totalProducts = 0;
let currentSearchTerm = '';
 let carrito = [];

// fetch('https://dummyjson.com/products?limit=0')
// .then(res => res.json())
// .then(data => {
//     productsData = data.products;
//     console.log('productos cargados: ', productsData);
//     displayProducts(productsData);  
    
// });

function loadProducts(page) {
  const skip = (page - 1) * productsPerPage;
  let url = '';

  if (currentSearchTerm) {

    url = `https://dummyjson.com/products/search?q=${currentSearchTerm}&limit=${productsPerPage}&skip=${skip}`;
  } else {
    
    url = `https://dummyjson.com/products?limit=${productsPerPage}&skip=${skip}`;
  }
  fetch(url)
    .then(res => res.json())
    .then(data => {
      productsData = data.products;
      totalProducts = data.total;
    //   console.log('productos cargados: ', productsData);

      displayProducts(productsData);
      updatePaginationButtons();
    });
}

function changePage(direction) {
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const newPage = currentPage + direction;

    // Validar que no nos salgamos de los límites
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        loadProducts(currentPage);
        // Opcional: Scrollear arriba al cambiar
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
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    if(nextBtn) nextBtn.disabled = (currentPage >= totalPages);
}

fetch('https://dummyjson.com/products/categories')
.then(res => res.json())
.then(data => {
    categoriesData = data.map(category => category.name);
    console.log('categorias cargadas: ', categoriesData);
    displayCategories(categoriesData);
});

function displayProducts(productsData) {
    const productsContainer = document.getElementById('gridCard');
    productsContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevos productos



    productsData.forEach(product => {
        const productCard = `
        <div class="card" style="width: 18rem;">
          <img class="card-img-top" src="${product.thumbnail}" alt="Card image cap">
          <div class="card-body">
            <h5 class="card-title">${product.title}</h5>
            <p class="card-text">${product.description}</p>

            <button class= "btn btn-info btn-sm me-2" onclick="verDetallesProducto(${product.id})">
                <i class="fa-solid fa-eye me-1"></i>Detalles
            </button>

            <button class= "btn btn-primary btn-sm" onclick="agregarAlCarrito(${product.id})">
                <i class="fa-solid fa-card-shopping me-1"></i>Agregar al carrito
            </button>

          </div>
        </div>
        `;
        productsContainer.innerHTML += productCard;
        
    }

    );
}

function displayCategories(categoriesData) {
    // Apuntamos al UL directamente
    const categoriesContainer = document.getElementById('category-list');
    categoriesContainer.innerHTML = ''; 

    categoriesData.forEach(category => {
        categoriesContainer.innerHTML += `
        <li class="nav-item">
          <a class="nav-link" href="#">${category}</a>
        </li>`;
    });
}

function verDetallesProducto(productId){
    const product= productsData.find(p => p.id === productId);
    if(!product) 
        return;
    
    const modalContent = document.getElementById('productoModalContenido');
    modalContent.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <img src="${product.thumbnail}" class="img-fluid rounded" alt="${product.title}">
            </div>
            <div class="col-md-6">
                <h3>${product.title}</h3>
                <p><strong>Categoría:</strong> ${product.category}</p>
                <p><strong>Precio:</strong> $${product.price}</p>
                <p><strong>Calificación:</strong> ${product.rating} ⭐</p>
                <p><strong>Stock:</strong> ${product.stock} unidades</p>
                <hr>
                <h5>Descripción:</h5>
                <p>${product.description}</p>
            </div>
        </div>
    `;
    
    const agregarBtn = document.getElementById('agregarDesdeModal');
    agregarBtn.onclick = function() {
        agregarAlCarrito(productId);
        const modal = bootstrap.Modal.getInstance(document.getElementById('productoModal'));
        modal.hide();
    };
    
    const modal = new bootstrap.Modal(document.getElementById('productoModal'));
    modal.show();
}


function agregarAlCarrito(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;
    

    const existingItem = carrito.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.cantidad += 1;
    } else {
        carrito.push({
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: product.thumbnail,
            cantidad: 1
        });
    }
    
    actualizarContadorCarrito();
    
    Swal.fire({
        icon: 'success',
        title: '¡Agregado!',
        text: `${product.title} se agregó al carrito`,
        showConfirmButton: false,
        timer: 1500
    });
    
    actualizarCarritoModal();

    const modal = new bootstrap.Modal(document.getElementById('carritoModal'));
    modal.show();
}

function actualizarContadorCarrito() {
    const carritoBadge = document.getElementById('carritoBadge');
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    
    if (totalItems > 0) {
        carritoBadge.textContent = totalItems;
        carritoBadge.style.display = 'block';
    } else {
        carritoBadge.style.display = 'none';
    }
}

function actualizarCarritoModal() {
    const carritoContenido = document.getElementById('carritoContenido');
    const carritoTotal = document.getElementById('carritoTotal');
    
    if (carrito.length === 0) {
        carritoContenido.innerHTML = '<p class="text-muted text-center py-4">Tu carrito está vacío</p>';
        carritoTotal.textContent = '$0';
        return;
    }
    
    let contenidoHTML = '';
    let total = 0;
    
    carrito.forEach(item => {
        const subtotal = item.price * item.cantidad;
        total += subtotal;
        
        contenidoHTML += `
        <div class="card mb-2">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-2">
                        <img src="${item.thumbnail}" alt="${item.title}" class="img-fluid rounded">
                    </div>
                    <div class="col-6">
                        <h6 class="mb-1">${item.title}</h6>
                        <p class="mb-0 text-muted">Precio unitario: $${item.price}</p>
                    </div>
                    <div class="col-2">
                        <div class="input-group input-group-sm">
                            <button class="btn btn-outline-secondary" onclick="cambiarCantidad(${item.id}, -1)">-</button>
                            <input type="text" class="form-control text-center" value="${item.cantidad}" readonly>
                            <button class="btn btn-outline-secondary" onclick="cambiarCantidad(${item.id}, 1)">+</button>
                        </div>
                    </div>
                    <div class="col-2 text-end">
                        <p class="mb-0 fw-bold">$${subtotal.toFixed(2)}</p>
                        <button class="btn btn-link text-danger p-0" onclick="eliminarDelCarrito(${item.id})">
                            <small>Eliminar</small>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    });
    
    carritoContenido.innerHTML = contenidoHTML;
    carritoTotal.textContent = `$${total.toFixed(2)}`;
}

function cambiarCantidad(productId, cambio){
    const item=carrito.find(item => item.id === productId);
    if(!item) return;
    item.cantidad += cambio;

    if(item.cantidad <= 0){
        eliminarDelCarrito(productId);
    }
    else{
        actualizarCarritoModal();
        actualizarContadorCarrito();
    }
}

function eliminarDelCarrito(productId){
    carrito=carrito.filter(item => item.id !== productId);
    actualizarCarritoModal();
    actualizarContadorCarrito();
}

 function buscarPorTalla(tallaData) {
    
 }



// Función de filtro
// function filterProducts() {
//     // 1. Obtener el valor del input
//     const searchInput = document.getElementById('searchInput');
//     const searchTerm = searchInput.value.toLowerCase().trim();
    
//     console.log('Buscando:', searchTerm);
    
//     // 2. Si no hay término de búsqueda, mostrar todos
//     if (!searchTerm) {
//         displayProducts(productsData);
//         return;
//     }
    
//     // 3. Filtrar los productos
//     const filteredProducts = productsData.filter(product => {
//         // Buscar en título
//         if (product.title.toLowerCase().includes(searchTerm)) return true;
        
//         // Buscar en descripción
//         if (product.description.toLowerCase().includes(searchTerm)) return true;
        
//         // Buscar en categoría
//         if (product.category.toLowerCase().includes(searchTerm)) return true;
        
//         return false;
//     });
    
//     // 4. Mostrar resultados
//     displayProducts(filteredProducts);
    
//     // 5. Opcional: mostrar mensaje
//     console.log(`Encontrados ${filteredProducts.length} productos`);
// }

// function filterProducts() {
//     // 1. Obtener el valor del input
//     const searchInput = document.getElementById('searchInput');
//     const searchTerm = searchInput.value.toLowerCase().trim();
    
//     // 2. Si no hay término de búsqueda, volver a la paginación normal
//     if (!searchTerm) {
//         currentPage = 1; // Volver a la primera página
//         loadProducts(currentPage);
//         return;
//     }
    
//     // 3. Buscar en TODA la API (sin límites de paginación)
//     fetch(`https://dummyjson.com/products/search?q=${searchTerm}`)
//         .then(res => res.json())
//         .then(data => {
//             productsData = data.products;
//             totalProducts = data.total;
            
//             console.log(`Encontrados ${productsData.length} productos para "${searchTerm}"`);
            
//             // Mostrar todos los resultados (sin paginación temporalmente)
//             displayProducts(productsData);
            
//             // Ocultar paginación durante la búsqueda
//             const paginationContainer = document.getElementById('pagination-container');
//             if (paginationContainer) {
//                 paginationContainer.style.display = 'none';
//             }
//         })
//         .catch(error => {
//             console.error('Error en la búsqueda:', error);
//         });
// }

function filterProducts() {
    const searchInput = document.getElementById('searchInput');
    const term = searchInput.value.toLowerCase().trim();

    currentSearchTerm = term;
    currentPage = 1; // Reiniciar a la primera página
    
    loadProducts(currentPage);

    console.log('Buscando:', currentSearchTerm);
}





loadProducts(currentPage);

{/* <div class="Card">
                    
    <div class="CardImg">
        <img src="https://m.media-amazon.com/images/I/71Mk8BC8KRL._AC_SX569_.jpg" alt="image 1">
    </div>

    <div>
        <h2>Producto 5</h2>
        <p>Descripción del producto 1</p>
        <h3>$45.000</h3>
    </div>
    <!-- <div>
        <button>Agregar al Carrito</button>
    </div> -->
    <div class="ButtonIconCard">
        <div>
            <button class="btn btn-primary">
                <i class="fa-solid fa-cart-shopping"></i> Agregar al Carrito
            </button>
        </div>

        <div>
            <img src="./graphic resources/icon/favorite_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" alt="aaaaa">
        </div>
    </div>
</div> */}





{/* <div class="card" style="width: 18rem;">
  <img class="card-img-top" src=".../100px180/" alt="Card image cap">
  <div class="card-body">
    <h5 class="card-title">Card title</h5>
    <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
    <a href="#" class="btn btn-primary">Go somewhere</a>
  </div>
</div> */}



{/* <div class="col-sm-6 col-md-4 col-lg-4 col-xl-3">
                        <div class="Card card h-100 border-0 shadow-sm">
                            <div class="CardImg card-img-top overflow-hidden" style="height: 180px;">
                                <img src="https://i5.walmartimages.com/asr/32ff166b-b51a-4344-b0a5-06e943d861fd.0b2ba1ce6e49ec41e8754363eb8fa98b.jpeg?odnHeight=612&odnWidth=612&odnBg=FFFFFF" 
                                     class="w-100 h-100 object-fit-cover" 
                                     alt="Producto 1">
                            </div>
                            
                            <div class="card-body d-flex flex-column">
                                <h5 class="card-title">Producto 1</h5>
                                <p class="card-text text-muted small">Descripción del producto 1</p>
                                <h4 class="text-primary fw-bold mt-auto">$45.000</h4>
                                
                                <div class="ButtonIconCard d-flex justify-content-between align-items-center mt-3">
                                    <button class="btn btn-primary btn-sm d-flex align-items-center">
                                        <i class="fa-solid fa-cart-shopping me-2"></i>
                                        <span class="d-none d-sm-inline">Agregar</span>
                                    </button>
                                    
                                    <button class="btn btn-outline-danger btn-sm p-2">
                                    <img src="./graphic resources/icon/favorite_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg" 
                                alt="Favorito" 
                                style="width: 20px; height: 20px;">
                            </button>
                        </div>
                    </div>
                </div> */}


