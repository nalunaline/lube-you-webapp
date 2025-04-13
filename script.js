const container = document.getElementById("product-list");
const cartCount = document.getElementById("cart-count");
const toast = document.getElementById("toast");

let cart = JSON.parse(localStorage.getItem('cart')) || {};

// Данные товаров
const products = [
  {
    id: "1",
    name: "J-Lube Powder 7g",
    category: "Lubricants",
    description: "Powder for preparing lubricant and soap bubbles, 7g, universal",
    usage: "Intimate use, soap bubbles",
    price: 251,
    photo: "https://nalunaline.github.io/lube-you-webapp/assets/images/jlube28b.jpg"
  },
  // ... остальные товары
];

// Инициализация
function init() {
  updateCartCount();
  setupTheme();
  renderProducts(products);
}

// Работа с корзиной
function updateCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const total = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = total;
}

// Взаимодействие с Telegram WebApp
function setupTheme() {
  if (!window.Telegram?.WebApp) return;
  
  const theme = window.Telegram.WebApp.colorScheme;
  document.body.classList.toggle('dark', theme === 'dark');
  
  window.Telegram.WebApp.onEvent('themeChanged', () => {
    const newTheme = window.Telegram.WebApp.colorScheme;
    document.body.classList.toggle('dark', newTheme === 'dark');
  });
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
    try {
      window.Telegram.WebApp.sendData(JSON.stringify({ items }));
    } catch (e) {
      console.error("Ошибка отправки данных:", e);
      showToast("Ошибка отправки заказа");
    }
  } else {
    console.log("Данные заказа (тест):", { items });
    showToast("Режим тестирования: заказ не отправлен");
  }
}

// Отображение товаров
function renderProducts(products) {
  if (!products?.length) {
    container.innerHTML = "<div class='empty'>Товары не найдены</div>";
    return;
  }

  container.innerHTML = products.map(product => `
    <div class="product-card" data-id="${product.id}">
      <img src="${product.photo}" alt="${product.name}" class="product-image" 
           onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <div class="product-price">${product.price}₽</div>
        <div class="product-description">${product.description}</div>
        <div class="product-controls">
          <button class="quantity-btn" onclick="changeQuantity('${product.id}', -1)">−</button>
          <span class="quantity">${cart[product.id]?.quantity || 0}</span>
          <button class="quantity-btn" onclick="changeQuantity('${product.id}', 1)">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Вспомогательные функции
function changeQuantity(productId, delta) {
  if (!cart[productId]) {
    cart[productId] = { ...products.find(p => p.id === productId), quantity: 0 };
  }
  
  cart[productId].quantity += delta;
  
  if (cart[productId].quantity <= 0) {
    delete cart[productId];
  }
  
  updateCart();
  updateProductQuantity(productId);
  
  if (delta > 0) {
    showToast("Добавлено в корзину");
  }
}

function updateProductQuantity(productId) {
  const quantityElement = container.querySelector(`.product-card[data-id="${productId}"] .quantity`);
  if (quantityElement) {
    quantityElement.textContent = cart[productId]?.quantity || 0;
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3000);
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);