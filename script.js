const API_URL = 'https://script.google.com/macros/s/AKfycbxJKno6H5HC8t6dZty-Ui16yhjKV7EMnyeoYj2MGQXk6tjPOTnsy8k6nR9TwB4MW6JiIw/exec';

class ProductAPI {
  static async getProducts() {
    try {
      const response = await fetch(API_URL);
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
  updateCartCount();

  // Обработчики событий
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });
});

function renderProducts(products) {
  const container = document.getElementById('product-list');
  container.innerHTML = products.map(product => `
    <div class="product-card">
      <img src="${product.image_url || 'no-image.jpg'}" 
           alt="${product.name}" 
           class="product-image"
           onerror="this.src='no-image.jpg'">
      <h3 class="product-title">${product.name}</h3>
      <div class="product-description">${product.description}</div>
      <div class="product-price">${product.price} ₽</div>
      <button class="add-btn" data-id="${product.id}">В корзину</button>
    </div>
  `).join('');

  // Обработчики для кнопок
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const productId = e.target.dataset.id;
      const product = products.find(p => p.id == productId);
      if (product) {
        cart.add(productId, product);
        showToast(`${product.name} добавлен в корзину`);
      }
    });
  });
}

function updateCartCount() {
  const countElement = document.getElementById('cart-count');
  if (countElement) {
    countElement.textContent = window.cart.totalItems || '0';
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function openCart() {
  if (window.cart.totalItems === 0) {
    showToast('Корзина пуста');
    return;
  }
  // Здесь будет логика открытия корзины
  alert(`Заказ оформлен! Товаров: ${window.cart.totalItems}`);
}