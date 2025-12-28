let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
// let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

function agregarAlCarrito(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (typeof allProducts === 'undefined' || allProducts.length === 0) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Productos no cargados. Intenta nuevamente.',
        });
        return;
    }
    
    
    if (!product) {
        // Si no está en allProducts, intentar cargarlo desde la API
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