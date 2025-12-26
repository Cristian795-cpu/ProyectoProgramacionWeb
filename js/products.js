

// fetch('https://dummyjson.com/products')
// .then(res => res.json())
// .then(console.log);

// fetch('https://dummyjson.com/products/categories')
// .then(res => res.json())
// .then(console.log);



 let productsData = [];
 let categoriesData = [];

fetch('https://dummyjson.com/products?limit=0')
.then(res => res.json())
.then(data => {
    productsData = data.products;
    console.log('productos cargados: ', productsData);
    displayProducts(productsData);  
    
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
            <h6> AAAAAAAAAAAAA</h6>
            <p class="card-text">${product.description}</p>

            <button class= "btn btn-info btn-sm me-2">
                <i class="fa-solid fa-eye me-1"></i>Detalles
            </button>

            <button class= "btn btn-primary btn-sm">
                <i class="fa-solid fa-card-shopping me-1"></i>Agregar al carrito
            </button>

          </div>
        </div>
        `;
        productsContainer.innerHTML += productCard;
        
    }

    );
}

// Función de filtro
function filterProducts() {
    // 1. Obtener el valor del input
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    console.log('Buscando:', searchTerm);
    
    // 2. Si no hay término de búsqueda, mostrar todos
    if (!searchTerm) {
        displayProducts(productsData);
        return;
    }
    
    // 3. Filtrar los productos
    const filteredProducts = productsData.filter(product => {
        // Buscar en título
        if (product.title.toLowerCase().includes(searchTerm)) return true;
        
        // Buscar en descripción
        if (product.description.toLowerCase().includes(searchTerm)) return true;
        
        // Buscar en categoría
        if (product.category.toLowerCase().includes(searchTerm)) return true;
        
        return false;
    });
    
    // 4. Mostrar resultados
    displayProducts(filteredProducts);
    
    // 5. Opcional: mostrar mensaje
    console.log(`Encontrados ${filteredProducts.length} productos`);
}



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


