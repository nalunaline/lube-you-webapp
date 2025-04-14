const container = document.getElementById("product-list");
const cartCount = document.getElementById("cart-count");
const MAX_QUANTITY = 10;

let cart = JSON.parse(localStorage.getItem('cart')) || {};
let products = [];

// Тестовые данные
const testProducts = [
  {
    id: "1",
    name: "J-Lube Powder 7g",
    price: 251,
    photo: "https://nalunaline.github.io/lube-you-webapp/assets/images/jlube28b.jpg",
    description: "Powder for lubricant, 7g"
  },
  {
    id: "2",
    name: "K-Lube Powder 18g", 
    price: 549,
    photo: "https://nalunaline.github.io/lube-you-webapp/assets/images/jlube56b.jpg",
    description: "Powder for lubricant, 18g"
  }
];

function loadProducts() {
  products = testProducts;
  renderProducts();
}

function renderProducts() {
  container.innerHTML = products.map(product => `
    <div class="product-card" data-id="${product.id}">
      <img src="${product.photo}" alt="${product.name}" class="product-image">
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

function showNotification(message) {
  const notification = document.getElementById('cart-notification');
  if (!notification) return;

  notification.textContent = message;
  notification.classList.add('visible');
  
  setTimeout(() => {
    notification.classList.remove('visible');
  }, 3000);
}

function changeQuantity(productId, delta) {
  const product = products.find(p => p.id === productId);
  if (!product) {
    showNotification("Товар не найден");
    return;
  }

  if (!cart[productId]) {
    cart[productId] = { ...product, quantity: 0 };
  }

  const newQuantity = cart[productId].quantity + delta;
  
  if (newQuantity < 0) {
    showNotification("Минимальное количество: 0");
    return;
  }
  
  if (newQuantity > MAX_QUANTITY) {
    showNotification(`Максимум: ${MAX_QUANTITY} шт.`);
    return;
  }

  cart[productId].quantity = newQuantity;

  if (cart[productId].quantity === 0) {
    delete cart[productId];
    showNotification(`${product.name} удален`);
  } else {
    showNotification(delta > 0 
      ? `${product.name} добавлен` 
      : `${product.name} уменьшено`);
  }

  saveCart();
  updateCart();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCart() {
  cartCount.textContent = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
}

function openCart() {
  if (Object.keys(cart).length === 0) {
    showNotification("Корзина пуста");
    return;
  }

  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.sendData(JSON.stringify(cart));
    showNotification("Заказ отправлен");
  } else {
    alert(`Тестовый режим\nТоваров: ${Object.values(cart).reduce((sum, item) => sum + item.quantity, 0)}`);
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCart();
});