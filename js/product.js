let favoritos=JSON.parse(localStorage.getItem("favoritos")) || [];
// let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function displayProducts(productsToRender) {
    const productsContainer = document.getElementById('gridCard');
    productsContainer.innerHTML = ''; // Limpiar el contenedor antes de agregar nuevos productos

    const favoritosGuardados =JSON.parse(localStorage.getItem("favoritos")) || [];


    productsToRender.forEach(product => {
        const isFavorito= favoritosGuardados.includes(product.id);
        const iconoFavorito= isFavorito
            ? "./graphic resources/icon/favorite_filled_red.svg"
            : "./graphic resources/icon/favorite_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg";

        const productCard = `
        <div class="card" style="width: 18rem;">
          <img class="card-img-top" src="${product.thumbnail}" alt="Card image cap">
          <div class="card-body">
            <h5 class="card-title">${product.title}</h5>
            <p class="card-text">${product.description}</p>
            <h4 class="text-primary fw-bold mt-3">$${product.price}</h4>
            <button class= "btn btn-info btn-sm me-2" onclick="verDetallesProducto(${product.id})">
                <i class="fa-solid fa-eye me-1"></i>Detalles
            </button>

            <img src="${iconoFavorito}" 
                alt="Favorito" 
                style="width: 25px; height: 25px; cursor: pointer; transition: transform 0.2s;"
                onclick="guardarFavoritoLocalStorage(${product.id})"
                id="favorito-${product.id}"
                class="favorite-icon">

          </div>
        </div>
        `;
        productsContainer.innerHTML += productCard;
        
    });
}

// function displayCategories(categoriesData) {
//     // Apuntamos al UL directamente
//     const categoriesContainer = document.getElementById('category-list');
//     categoriesContainer.innerHTML = ''; 

//     categoriesData.forEach(category => {
//         categoriesContainer.innerHTML += `
//         <li class="nav-item">
//           <a class="nav-link" href="#" onclick="filterByCategory('${category}')">${category}</a>
//         </li>`;
//     });


// }

function displayCategories(categoriesData) {
    // Apuntamos al UL directamente
    const categoriesContainer = document.getElementById('category-list');
    const categoriesContainerMobile = document.getElementById('category-list-mobile');
    if(categoriesContainerMobile){
        categoriesContainer.innerHTML = ''; 
    }
    
    if(categoriesContainerMobile){
        categoriesContainerMobile.innerHTML = ''; 
    }

    categoriesData.forEach(category => {
        if(categoriesContainerMobile){
            categoriesContainerMobile.innerHTML += `
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="filterByCategory('${category}')">${category}</a>
            </li>`;
        }

        if(categoriesContainer){
            categoriesContainer.innerHTML += `
            <li class="nav-item">
                <a class="nav-link" href="#" onclick="filterByCategory('${category}')">${category}</a>
            </li>`;
        }
        
    });
}

window.verDetallesProducto= function(productId){
    if (!window.allProducts || window.allProducts.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Cargando productos...',
            text: 'Por favor, espera a que se carguen los productos.',
            showConfirmButton: false,
            timer: 2000
        });
        return;
    }

    const product= window.allProducts.find(p => p.id === productId);
    if(!product) {
        Swal.fire({
            icon: 'error',
            title: 'Producto no encontrado',
            text: 'El producto solicitado no existe.',
        });
        return;
    }
    
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

window.guardarFavoritoLocalStorage= function(productId) {
    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
    const productIndex = favoritos.indexOf(productId);
    const iconoElement = document.getElementById(`favorito-${productId}`);
    
    if (productIndex === -1) {
        favoritos.push(productId);
        localStorage.setItem("favoritos", JSON.stringify(favoritos));
        
        // Cambiar icono a rojo
        if (iconoElement) {
            iconoElement.src = "./graphic resources/icon/favorite_filled_red.svg";
            iconoElement.style.transform = "scale(1.5)";
            setTimeout(() => {
                iconoElement.style.transform = "scale(1)";
            }, 1000);
        }
        
        Swal.fire({
            icon: 'success',
            title: '¡Agregado a favoritos!',
            showConfirmButton: false,
            timer: 1000
        });
    } else {
        // Quitar de favoritos
        favoritos.splice(productIndex, 1);
        localStorage.setItem("favoritos", JSON.stringify(favoritos));
        
        // Cambiar icono a gris
        if (iconoElement) {
            iconoElement.src = "./graphic resources/icon/favorite_24dp_E3E3E3_FILL0_wght400_GRAD0_opsz24.svg";
            iconoElement.style.transform = "scale(1.5)";
            setTimeout(() => {
                iconoElement.style.transform = "scale(1)";
            }, 1000);
        }
        
        Swal.fire({
            icon: 'info',
            title: 'Eliminado de favoritos',
            showConfirmButton: false,
            timer: 1000
        });
    }
    
    console.log("Favoritos actualizados: ", favoritos);
}

window.displayProducts = displayProducts;
window.displayCategories = displayCategories;