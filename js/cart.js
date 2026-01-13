let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

// Agrega un producto al carrito
function agregarAlCarrito(productId) {
    // Encontrar el producto en allProducts
    const product = window.allProducts.find(p => p.id === productId);
    if (!window.allProducts || window.allProducts.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Productos no cargados. Intenta nuevamente.',
        });
        return;
    }
    
    // Si no está en allProducts, intentar cargarlo desde la API
    if (!product) {
        
        fetch(`https://dummyjson.com/products/${productId}`)
            .then(res => res.json())
            .then(product => {
                agregarProductoAlCarrito(product);
            })
            .catch(error => {
                console.error('Error al cargar producto:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo agregar el producto al carrito.',
                });
            });
        return;
    }
    
    agregarProductoAlCarrito(product);
}

// Agrega el producto al modal del carrito
function agregarProductoAlCarrito(product) {
    const existingItem = carrito.find(item => item.id === product.id);
    
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
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
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
        carritoContenido.innerHTML = '<p class="text-muted text-center py-4">Tu carrito esta vacio</p>';
        carritoTotal.textContent = '$0';
        return;
    }
    
    let contenidoHTML = '';
    let total = 0;
    
    carrito.forEach(item => {
        const subtotal = item.price * item.cantidad;
        total += subtotal;
        
        contenidoHTML += `
        <div class="border-bottom pb-2 mb-2">
            <div class="card-body p-2">
                <div class="row align-items-center g-2">
                    <!-- Imagen -->
                    <div class="col-3">
                        <img src="${item.thumbnail}" alt="${item.title}" 
                             class="img-fluid rounded w-100"
                             style="max-width: 70px; height: 70px; object-fit: cover;">
                    </div>
                    
                    <!-- Informacion del producto -->
                    <div class="col-5">
                        <h6 class="mb-0 fw-bold text-break" style="font-size: 0.9rem;">${item.title}</h6>
                        <p class="mb-0 text-muted small">$${item.price.toFixed(2)}</p>
                    </div>
                    
                    <!-- Controles de cantidad -->
                    <div class="col-4">
                        <div class="input-group input-group-sm d-flex justify-content-center">
                            <button class="btn btn-outline-secondary border-end-0" 
                                    onclick="cambiarCantidad(${item.id}, -1)"
                                    style="padding: 0.25rem 0.5rem; min-width: 30px;">-</button>
                            <input type="text" class="form-control text-center border-start-0 border-end-0" 
                                   value="${item.cantidad}" 
                                   readonly
                                   style="width: 40px; padding: 0.25rem;">
                            <button class="btn btn-outline-secondary border-start-0" 
                                    onclick="cambiarCantidad(${item.id}, 1)"
                                    style="padding: 0.25rem 0.5rem; min-width: 30px;">+</button>
                        </div>
                    </div>
                    
                    <!-- Total y eliminar -->
                    <div class="col-12 mt-2">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <p class="mb-0 fw-bold text-success">$${subtotal.toFixed(2)}</p>
                            </div>
                            <div>
                                <button class="btn btn-sm btn-link text-danger p-0" 
                                        onclick="eliminarDelCarrito(${item.id})">
                                    <small><i class="fas fa-trash-alt me-1"></i>Eliminar</small>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    });
    
    carritoContenido.innerHTML = contenidoHTML;
    carritoTotal.textContent = `$${total.toFixed(2)}`;
}

// Cambio de cantidad de un producto en el carrito
function cambiarCantidad(productId, cambio){
    const item=carrito.find(item => item.id === productId);
    if(!item) return;
    item.cantidad += cambio;

    if(item.cantidad <= 0){
        eliminarDelCarrito(productId);
    }
    else{
        localStorage.setItem("carrito", JSON.stringify(carrito))
        actualizarCarritoModal();
        actualizarContadorCarrito();
    }
}

function eliminarDelCarrito(productId){
    carrito=carrito.filter(item => item.id !== productId);

    localStorage.setItem("carrito", JSON.stringify(carrito))
    actualizarCarritoModal();
    actualizarContadorCarrito();

    Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: 'Producto eliminado del carrito',
        showConfirmButton: false,
        timer: 1000
    });
}
