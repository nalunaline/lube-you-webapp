const directData = [
  {
    id: "1",
    name: "J-Lube Powder 7g",
    description: "Powder for preparing lubricant and soap bubbles, 7g, universal",
    price: 251,
    image_url: "https://nalunaline.github.io/lube-you-webapp/assets/images/jlube28b.jpg"
  },
  {
    id: "2",
    name: "K-Lube Powder 18g",
    description: "Powder for lubricant, 18g, suitable for massage and intimate use",
    price: 549,
    image_url: "https://nalunaline.github.io/lube-you-webapp/assets/images/jlube56b.jpg"
  },
  {
    id: "3",
    name: "J-Lube Powder 56g",
    description: "Powder for lubricant, 56g, economical volume for regular use",
    price: 521,
    image_url: "https://nalunaline.github.io/lube-you-webapp/assets/images/jlube7.jpg"
  }
];

class ProductAPI {
  static async getProducts() {
    try {
      console.log("Загрузка продуктов...");
      // Используем прямые данные для теста
      return directData.map(item => ({
        id: item.id.toString(),
        name: item.name,
        description: item.description,
        price: Number(item.price),
        image_url: item.image_url || 'https://via.placeholder.com/150'
      }));
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

  changeQuantity(productId, delta) {
    if (!this.items[productId]) {
      this.items[productId] = { id: productId, quantity: 0 };
    }
    this.items[productId].quantity += delta;
    if (this.items[productId].quantity <= 0) {
      delete this.items[productId];
    }
    this.save();
  }

  save() {
    localStorage.setItem('cart', JSON.stringify(this.items));
    updateCartCount();
    renderProducts(directData); // Перерисовываем для обновления количества
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
});

function renderProducts(products) {
  const container = document.getElementById('product-list');
  container.innerHTML = products.map(product => `
    <div class="product-card">
      <img src="${product.image_url || 'https://via.placeholder.com/150'}" 
           alt="${product.name}" 
           class="product-image"
           onerror="this.src='https://via.placeholder.com/150'">
      <h3 class="product-title">${product.name}</h3>
      <div class="product-description">${product.description}</div>
      <div class="product-price">${product.price} ₽</div>
      <div class="product-controls">
        <button class="quantity-btn" onclick="window.cart.changeQuantity('${product.id}', -1)">−</button>
        <span class="quantity">${window.cart.items[product.id]?.quantity || 0}</span>
        <button class="quantity-btn" onclick="window.cart.changeQuantity('${product.id}', 1)">+</button>
      </div>
    </div>
  `).join('');
}

function updateCartCount() {
  const countElement = document.getElementById('cart-count');
  if (countElement) {
    countElement.textContent = window.cart.totalItems || '0';
  }
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

function openCart() {
  if (window.cart.totalItems === 0) {
    showToast('Корзина пуста');
    return;
  }
  const items = Object.values(window.cart.items).map(item => ({
    title: item.name,
    price: item.price,
    quantity: item.quantity
  }));
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.sendData(JSON.stringify({ items }));
    showToast('Заказ отправлен');
  } else {
    console.log('Telegram Web App не доступен, данные:', items);
    showToast('Ошибка: Telegram Web App не доступен');
  }
}