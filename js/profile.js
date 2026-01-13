// cargar las preferencias al iniciar la pagina
document.addEventListener('DOMContentLoaded', () => {
    initProfile();
});

// Inicializar el modal del perfil
function initProfile() {
    const saveBtn = document.getElementById('btnGuardarPreferencias');
    const clearBtn = document.getElementById('btnLimpiarPreferencias');
    
    // Event Listeners para los botones del modal
    if (saveBtn) saveBtn.addEventListener('click', savePreferences);
    if (clearBtn) clearBtn.addEventListener('click', clearPreferences);

    // Llenar las opciones al abrir el modal (o al cargar la página)
    populateCategoryOptions();
}

// Llenar el modal con checkboxes de categorias de la apu
async function populateCategoryOptions() {
    const container = document.getElementById('profileCategoriesContainer');
    if(!container) return; // Si no existe el modal en el HTML actual, salir

    container.innerHTML = '<div class="spinner-border spinner-border-sm text-primary" role="status"></div> Cargando categorias...';

    try {
        // DummyJSON endpoint para lista de categorías
        const response = await fetch('https://dummyjson.com/products/category-list');
        const categories = await response.json();
        
        // Recuperar preferencias guardadas anteriormente
        const savedPrefs = JSON.parse(localStorage.getItem('vestia_user_prefs')) || [];

        container.innerHTML = ''; // Limpiar spinner

        // Crear un checkbox por cada categoria
        categories.forEach((category, index) => {
            // Verificar si estaba seleccionada
            const isChecked = savedPrefs.includes(category) ? 'checked' : '';
            // Crear el HTML del checkbox
            const html = `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="${category}" id="pref-category-${index}" ${isChecked}>
                    <label class="form-check-label text-capitalize" for="pref-category-${index}">
                        ${category}
                    </label>
                </div>
            `;
            container.innerHTML += html;
        });

    } catch (error) {
        console.error('Error cargando categorias para perfil:', error);
        container.innerHTML = '<p class="text-danger small">No se pudieron cargar las categorias.</p>';
    }
}

// Guardar preferencias en LocalStorage y recargar
function savePreferences() {
    const checkboxes = document.querySelectorAll('#profileCategoriesContainer input[type="checkbox"]:checked');
    const selectedCategories = Array.from(checkboxes).map(checkbox => checkbox.value);

    // Si desmarca todo, borramos la preferencia
    if (selectedCategories.length === 0) {
        
        localStorage.removeItem('vestia_user_prefs');
    } else {
        localStorage.setItem('vestia_user_prefs', JSON.stringify(selectedCategories));
    }

    // Ocultar modal usando bootstrap instance
    const modalEl = document.getElementById('profileModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if(modal) modal.hide();

    // Alerta y Recarga
    Swal.fire({
        icon: 'success',
        title: '¡Preferencias actualizadas!',
        text: 'Filtrando productos según tus gustos...',
        timer: 1000,
        showConfirmButton: false
    }).then(() => {
        window.location.reload(); // Recargar para que main.js aplique los filtros desde cero
    });
}

// Limpiar preferencias
function clearPreferences() {
    // Desmarcar visualmente
    const checkboxes = document.querySelectorAll('#profileCategoriesContainer input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);
    
    // Borrar de storage y recargar
    localStorage.removeItem('vestia_user_prefs');
    savePreferences(); 
}

// filtrar productos segun preferencias guardadas para usarla en main.js
function applyProfileFilters(productsArray) {
    const savedPrefs = JSON.parse(localStorage.getItem('vestia_user_prefs'));

    // Si no hay preferencias o el array esta vacio, devolvemos todo igual
    if (!savedPrefs || savedPrefs.length === 0) {
        return productsArray;
    }

    // console.log("Aplicando", savedPrefs);
    
    // Retornamos solo los productos marcados en la categoria de preferencias
    return productsArray.filter(product => savedPrefs.includes(product.category));
}
