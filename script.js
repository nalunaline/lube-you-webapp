const container = document.getElementById("product-list");
const cartCount = document.getElementById("cart-count");
const MAX_QUANTITY = 10;

let cart = JSON.parse(localStorage.getItem('cart')) || {};
let products = [];

// Категории товаров
const categories = {
  poppers: [
    {
      id: "1",
      name: "Swiss Navy Naked 118...",
      price: 1800,
      category: "poppers",
      image: "https://example.com/popper1.jpg"
    },
    {
      id: "2",
      name: "Amsterdam Gold 25ml",
      price: 1400,
      category: "poppers",
      image: "https://example.com/popper2.jpg"
    }
  ],
  lubricants: [
    {
      id: "3",
      name: "Lemon Lubricant 100...",
      price: 900,
      category: "lubricants",
      image: "https://example.com/lube1.jpg"
    }
  ]
};

function loadProducts(category = 'poppers') {
  products = categories[category] || [];
  renderProducts();
}

function renderProducts() {
  container.innerHTML = products.map(product => {
    const inCart = cart[product.id]?.quantity || 0;
    return `
      <div class="product-card" data-id="${product.id}">
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <h3 class="product-title">${product.name}</h3>
        <div class="product-price">${product.price} ₽</div>
        <div class="product-controls">
          ${inCart > 0 ? `
            <div class="quantity-controls">
              <button class="quantity-btn" onclick="changeQuantity('${product.id}', -1)">-</button>
              <div class="quantity-badge">${inCart}</div>
              <button class="quantity-btn" onclick="changeQuantity('${product.id}', 1)">+</button>
            </div>
          ` : `
            <button class="quantity-btn" onclick="changeQuantity('${product.id}', 1)">Добавить</button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

function changeQuantity(productId, delta) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  if (!cart[productId]) {
    cart[productId] = { ...product, quantity: 0 };
  }

  const newQuantity = cart[productId].quantity + delta;
  
  if (newQuantity < 0) return;
  if (newQuantity > MAX_QUANTITY) return;

  cart[productId].quantity = newQuantity;

  if (cart[productId].quantity === 0) {
    delete cart[productId];
  }

  saveCart();
  updateCart();
  renderProducts();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCart() {
  const total = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = total > 0 ? `(${total})` : '';
}

function openCart() {
  if (Object.keys(cart).length === 0) {
    alert("Корзина пуста");
    return;
  }

  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.sendData(JSON.stringify(cart));
  } else {
    alert(`Заказ отправлен!\nТоваров: ${Object.values(cart).reduce((sum, item) => sum + item.quantity, 0)}`);
  }
}

function showCategory(category) {
  loadProducts(category);
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCart();
});