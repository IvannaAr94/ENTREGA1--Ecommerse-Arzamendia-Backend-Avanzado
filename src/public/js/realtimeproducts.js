// =====================================================
// realtimeproducts.js
// Maneja la comunicación del cliente con Socket.io.
// =====================================================

const socket = io();
const productForm = document.getElementById('productForm');
const productsContainer = document.getElementById('productsContainer');
const errorMessage = document.getElementById('errorMessage');

function renderProducts(products) {
  if (!products || products.length === 0) {
    productsContainer.innerHTML = '<p class="empty-message">Todavía no hay productos cargados.</p>';
    return;
  }

  productsContainer.innerHTML = products.map((product) => `
    <article class="product-card">
      <h3>${product.title}</h3>
      <p>${product.description}</p>
      <p><strong>ID:</strong> ${product.id}</p>
      <p><strong>Código:</strong> ${product.code}</p>
      <p><strong>Precio:</strong> $${product.price}</p>
      <p><strong>Stock:</strong> ${product.stock}</p>
      <p><strong>Categoría:</strong> ${product.category}</p>
      <button class="delete-button" data-id="${product.id}">Eliminar</button>
    </article>
  `).join('');
}

productForm.addEventListener('submit', (event) => {
  event.preventDefault();
  errorMessage.textContent = '';

  const formData = new FormData(productForm);
  const productData = Object.fromEntries(formData.entries());

  socket.emit('addProduct', productData);
  productForm.reset();
});

productsContainer.addEventListener('click', (event) => {
  if (event.target.classList.contains('delete-button')) {
    const productId = event.target.dataset.id;
    socket.emit('deleteProduct', productId);
  }
});

socket.on('productsList', (products) => {
  renderProducts(products);
});

socket.on('productError', (message) => {
  errorMessage.textContent = message;
});
