const container = document.getElementById("product-list");
const cartCount = document.getElementById("cart-count");
const toast = document.getElementById("toast");

let cart = JSON.parse(localStorage.getItem('cart')) || {};
let products = [];

// Инициализация приложения
async function init() {
  updateCartCount();
  setupTheme();
  
  try {
    container.innerHTML = '<div class="loading">Загрузка товаров...</div>';
    await loadProductsFromSheets();
    renderProducts(products);
  } catch (error) {
    console.error("Ошибка загрузки товаров:", error);
    container.innerHTML = '<div class="error">Ошибка загрузки товаров</div>';
    showToast("Ошибка загрузки товаров");
  }
}

// Загрузка товаров через Google Apps Script
async function loadProductsFromSheets() {
  // ЗАМЕНИТЕ НА ВАШ URL СКРИПТА
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyE_TIxfmfkGaDJhx2xcbXmG88ttB9d0MhjcFrZjLOIDQA0PdFDi8LDIqfFSsRgRCTMyg/exec';
  
  const response = await fetch(SCRIPT_URL);
  const data = await response.json();
  
  products = data.map(item => ({
    id: item.ID.toString(),
    name: item.Name,
    category: item.Category,
    description: item.Description,
    price: Number(item.Price),
    photo: item.Photo || 'https://via.placeholder.com/150'
  }));
}

// Рендеринг товаров
function renderProducts(products) {
  container.innerHTML = products.map(product => `
    <div class="product-card">
      <img src="${product.photo}" alt="${product.name}" class="product-image">
      <div class="product-info">
        <h3>${product.name}</h3>
        <div class="product-price">${product.price}₽</div>
        <div class="product-controls">
          <button onclick="changeQuantity('${product.id}', -1)">−</button>
          <span class="quantity">${cart[product.id]?.quantity || 0}</span>
          <button onclick="changeQuantity('${product.id}', 1)">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Функции корзины
function changeQuantity(productId, delta) {
  if (!cart[productId]) {
    const product = products.find(p => p.id === productId);
    cart[productId] = {...product, quantity: 0};
  }
  
  cart[productId].quantity += delta;
  
  if (cart[productId].quantity <= 0) {
    delete cart[productId];
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  
  // Обновляем отображение количества
  const quantityElement = document.querySelector(`.product-card[data-id="${productId}"] .quantity`);
  if (quantityElement) {
    quantityElement.textContent = cart[productId]?.quantity || 0;
  }
}

function updateCartCount() {
  const total = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = total;
}

function openCart() {
  const items = Object.values(cart)
    .filter(item => item.quantity > 0)
    .map(item => ({
      title: item.name,
      price: item.price,
      quantity: item.quantity
    }));

  if (items.length === 0) {
    showToast("Корзина пуста");
    return;
  }

  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.sendData(JSON.stringify({ items }));
  } else {
    console.log("Тестовые данные:", { items });
    showToast("Заказ отправлен (тест)");
  }
}

// Вспомогательные функции
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3000);
}

function setupTheme() {
  if (window.Telegram?.WebApp) {
    document.body.classList.toggle('dark', 
      window.Telegram.WebApp.colorScheme === 'dark');
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', init);
window.changeQuantity = changeQuantity;
window.openCart = openCart;