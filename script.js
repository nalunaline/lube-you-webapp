// Инициализация WebApp
if (window.Telegram?.WebApp) {
  console.log("Инициализация Telegram WebApp...");
  Telegram.WebApp.expand();
  Telegram.WebApp.MainButton.setText('Оформить заказ');
  Telegram.WebApp.MainButton.show();
  Telegram.WebApp.MainButton.onClick(() => {
    console.log("Нажата кнопка MainButton");
    openCart();
  });
}

const directData = [
  {
    id: "1",
    name: "J-Lube Powder 7g",
    description: "Powder for preparing lubricant and soap bubbles, 7g, universal",
    price: 251,
    image_url: "https://nalunaline.github.io/lube-you-webapp/assets/images/jlube28b.jpg",
    category: "Лубриканты"
  },
  {
    id: "2",
    name: "K-Lube Powder 18g",
    description: "Powder for lubricant, 18g, suitable for massage and intimate use",
    price: 549,
    image_url: "https://nalunaline.github.io/lube-you-webapp/assets/images/jlube56b.jpg",
    category: "Лубриканты"
  },
  {
    id: "3",
    name: "J-Lube Powder 56g",
    description: "Powder for lubricant, 56g, economical volume for regular use",
    price: 521,
    image_url: "https://nalunaline.github.io/lube-you-webapp/assets/images/jlube7.jpg",
    category: "Лубриканты"
  },
  {
    id: "4",
    name: "Swiss Navy Naked 118ml",
    description: "Popper for relaxation, 118ml",
    price: 1800,
    image_url: "https://via.placeholder.com/150",
    category: "Попперы"
  }
];

const categories = [
  { id: "all", name: "Все товары" },
  { id: "Попперы", name: "Попперы" },
  { id: "Лубриканты", name: "Лубриканты" }
];

class ProductAPI {
  static async getProducts() {
    try {
      console.log("Загрузка продуктов...");
      const products = directData.map(item => {
        console.log("Обработка продукта:", item.name);
        return {
          id: item.id.toString(),
          name: item.name,
          description: item.description,
          price: Number(item.price),
          image_url: item.image_url || 'https://via.placeholder.com/150',
          category: item.category
        };
      });
      console.log("Продукты загружены:", products);
      return products;
    } catch (error) {
      console.error('Product load error:', error);
      showToast('Ошибка загрузки товаров');
      return [];
    }
  }

  static async getCategories() {
    try {
      console.log("Загрузка категорий...");
      return categories;
    } catch (error) {
      console.error('Category load error:', error);
      return [];
    }
  }
}

class Cart {
  constructor() {
    console.log("Инициализация корзины...");
    this.items = JSON.parse(localStorage.getItem('cart')) || {};
  }

  add(productId, product) {
    console.log(`Добавление продукта ${productId} в корзину...`);
    if (!this.items[productId]) {
      this.items[productId] = { ...product, quantity: 0 };
    }
    this.items[productId].quantity++;
    this.save();
  }

  changeQuantity(productId, delta) {
    console.log(`Изменение количества продукта ${productId} на ${delta}...`);
    if (!this.items[productId]) {
      this.items[productId] = { id: productId, quantity: 0 };
    }
    this.items[productId].quantity += delta;
    if (this.items[productId].quantity <= 0) {
      delete this.items[productId];
      showToast('Товар удалён из корзины');
    } else {
      showToast(delta > 0 ? 'Товар добавлен в корзину' : 'Товар удалён (1)');
    }
    this.save();
  }

  remove(productId) {
    console.log(`Удаление продукта ${productId} из корзины...`);
    delete this.items[productId];
    this.save();
    showCart();
  }

  save() {
    console.log("Сохранение корзины в localStorage...");
    localStorage.setItem('cart', JSON.stringify(this.items));
    updateCartCount();
    if (window.products && window.currentCategory) {
      console.log("Перерисовка каталога...");
      showCatalog(window.currentCategory);
    }
  }

  get totalItems() {
    const total = Object.values(this.items).reduce((sum, item) => sum + item.quantity, 0);
    console.log("Общее количество товаров в корзине:", total);
    return total;
  }

  get totalPrice() {
    return Object.values(this.items).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  clear() {
    console.log("Очистка корзины...");
    this.items = {};
    localStorage.removeItem('cart');
    updateCartCount();
    if (window.products && window.currentCategory) {
      showCatalog(window.currentCategory);
    }
  }
}

async function renderProducts(products) {
  const container = document.getElementById('product-list');
  if (!container) {
    console.error('Container #product-list not found');
    showToast('Ошибка: контейнер для товаров не найден');
    return;
  }

  console.log("Рендеринг продуктов...");
  container.innerHTML = '<div class="loading">Загрузка...</div>';

  if (!products || products.length === 0) {
    console.warn("Продукты не найдены или массив пуст");
    container.innerHTML = '<div class="error">Товары не найдены</div>';
    return;
  }

  try {
    const html = products.map(product => `
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
    container.innerHTML = html;
    console.log("Рендеринг завершён");
  } catch (error) {
    console.error("Ошибка рендеринга:", error);
    container.innerHTML = '<div class="error">Ошибка рендеринга товаров</div>';
    showToast('Ошибка рендеринга товаров');
  }
}

function updateCartCount() {
  console.log("Обновление счётчика корзины...");
  const countElement = document.getElementById('cart-count');
  if (countElement) {
    countElement.textContent = window.cart.totalItems || '0';
  } else {
    console.error('Элемент #cart-count не найден');
  }
}

function showToast(message) {
  console.log("Показ уведомления:", message);
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  } else {
    console.error('Элемент #toast не найден');
  }
}

async function showCatalog(categoryId = 'all') {
  console.log("Показ каталога для категории:", categoryId);
  window.currentCategory = categoryId;

  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.nav-btn[data-category="${categoryId}"]`)?.classList.add('active');

  let products = window.products || [];
  if (categoryId !== 'all') {
    products = products.filter(product => product.category === categoryId);
  }
  console.log("Отфильтрованные продукты:", products);
  await renderProducts(products);
}

function showCart() {
  console.log("Открытие корзины...");
  const modal = document.createElement('div');
  modal.className = 'cart-modal';
  modal.innerHTML = `
    <div class="cart-modal-content">
      <h2>Корзина</h2>
      <button class="close-btn" onclick="this.closest('.cart-modal').remove()">✕</button>
      <div class="cart-items" id="cart-items"></div>
      <div class="cart-total">Итого: <span id="cart-total-price">${window.cart.totalPrice} ₽</span></div>
      <button class="checkout-btn" onclick="openCart()">Оформить заказ (${window.cart.totalPrice} ₽)</button>
    </div>
  `;
  document.body.appendChild(modal);

  const cartItems = document.getElementById('cart-items');
  const items = Object.values(window.cart.items);
  if (items.length === 0) {
    cartItems.innerHTML = '<div class="error">Корзина пуста</div>';
    return;
  }

  cartItems.innerHTML = items.map(item => `
    <div class="cart-item">
      <img src="${item.image_url || 'https://via.placeholder.com/50'}" alt="${item.name}" class="cart-item-image">
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${item.price} ₽</div>
      </div>
      <div class="cart-item-controls">
        <button class="quantity-btn" onclick="window.cart.changeQuantity('${item.id}', -1)">−</button>
        <span class="quantity">${item.quantity}</span>
        <button class="quantity-btn" onclick="window.cart.changeQuantity('${item.id}', 1)">+</button>
        <button class="delete-btn" onclick="window.cart.remove('${item.id}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

async function openCart() {
  console.log("Оформление заказа...");
  if (!window.cart || Object.keys(window.cart.items).length === 0) {
    console.warn("Корзина пуста");
    showToast('Корзина пуста');
    return;
  }

  const items = Object.values(window.cart.items).map(item => ({
    title: item.name,
    price: item.price,
    quantity: item.quantity
  }));
  console.log("Данные корзины для отправки:", items);

  if (window.Telegram?.WebApp) {
    try {
      window.Telegram.WebApp.sendData(JSON.stringify({ items }));
      console.log("Данные отправлены через Telegram.WebApp");
      showToast('Заказ отправлен');
      window.cart.clear();
      document.querySelector('.cart-modal')?.remove();
    } catch (error) {
      console.error('WebApp error:', error);
      showToast('Ошибка: ' + error.message);
    }
  } else {
    console.log('Telegram Web App не доступен, данные:', items);
    showToast('Ошибка: Telegram Web App не доступен');
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
  console.log("DOM полностью загружен, инициализация...");
  try {
    window.cart = new Cart();
    console.log("Корзина инициализирована");

    window.categories = await ProductAPI.getCategories();
    console.log("Категории получены:", window.categories);

    window.products = await ProductAPI.getProducts();
    console.log("Продукты получены:", window.products);

    // Рендерим категории
    const categoryContainer = document.createElement('div');
    categoryContainer.className = 'category-list';
    categoryContainer.innerHTML = window.categories.map(category => `
      <button class="nav-btn ${category.id === 'all' ? 'active' : ''}" 
              data-category="${category.id}" 
              onclick="showCatalog('${category.id}')">
        ${category.name}
      </button>
    `).join('');
    document.querySelector('.header-nav').innerHTML = categoryContainer.outerHTML + `
      <button class="nav-btn cart-btn" onclick="showCart()">🛒 Корзина <span id="cart-count">0</span></button>
    `;

    await showCatalog('all');
    updateCartCount();
  } catch (error) {
    console.error("Ошибка инициализации:", error);
    showToast('Ошибка инициализации приложения');
    const container = document.getElementById('product-list');
    if (container) {
      container.innerHTML = '<div class="error">Ошибка загрузки приложения</div>';
    }
  }
});