const API_URL = 'https://script.google.com/macros/s/AKfycbxeQ_vwEUyGKz8XMPK8NM3MI5OsdlDQmUQ700JfweqQi96c_NlDSN3qENyNaltgbrCZ9w/exec';

class ProductAPI {
  static async getProducts() {
    try {
      const response = await fetch(`${API_URL}?sheetName=Products`);
      if (!response.ok) throw new Error('Network error');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Product load error:', error);
      showToast('Ошибка загрузки товаров');
      return [];
    }
  }
}

class Cart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('cart')) || {};
  }

  add(productId, product) {
    if (!this.items[productId]) {
      this.items[productId] = { ...product, quantity: 0 };
    }
    this.items[productId].quantity++;
    this.save();
  }

  remove(productId) {
    delete this.items[productId];
    this.save();
  }

  save() {
    localStorage.setItem('cart', JSON.stringify(this.items));
    updateCartCount();
  }

  get totalItems() {
    return Object.values(this.items).reduce((sum, item) => sum + item.quantity, 0);
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
  const cart = new Cart();
  window.cart = cart;
  
  // Загрузка товаров
  const products = await ProductAPI.getProducts();
  renderProducts(products);

  // Обработчики кнопок
  document.querySelector('.nav-btn[onclick="showCatalog()"]').addEventListener('click', () => {
    renderProducts(products);
  });

  document.querySelector('.checkout-button').addEventListener('click', () => {
    if (cart.totalItems === 0) {
      showToast('Корзина пуста');
      return;
    }
    openCart();
  });
});

function renderProducts(products) {
  const container = document.getElementById('product-list');
  container.innerHTML = products.map(product => `
    <div class="product-card">
      <img src="${product.image || 'no-image.jpg'}" alt="${product.name}" class="product-image">
      <h3>${product.name}</h3>
      <div class="price">${product.price} ₽</div>
      <button class="add-btn" data-id="${product.id}">В корзину</button>
    </div>
  `).join('');

  // Добавляем обработчики для новых кнопок
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = e.target.dataset.id;
      const product = products.find(p => p.id === productId);
      cart.add(productId, product);
      showToast(`${product.name} добавлен в корзину`);
    });
  });
}

function updateCartCount() {
  const countElement = document.getElementById('cart-count');
  countElement.textContent = window.cart.totalItems;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}