const container = document.getElementById("product-list");
const cartCount = document.getElementById("cart-count");
const MAX_QUANTITY = 10;

let cart = JSON.parse(localStorage.getItem('cart')) || {};
let currentCategory = 'poppers';

// Категории товаров
const categories = {
  poppers: [
    {
      id: "1",
      name: "Swiss Navy Naked 118...",
      price: 1800,
      image: "https://via.placeholder.com/300?text=Swiss+Navy"
    },
    {
      id: "2",
      name: "Amsterdam Gold 25ml",
      price: 1400,
      image: "https://via.placeholder.com/300?text=Amsterdam+Gold"
    },
    {
      id: "3",
      name: "Original 30ml",
      price: 1900,
      image: "https://via.placeholder.com/300?text=Original"
    }
  ],
  lubricants: [
    {
      id: "4",
      name: "Lemon Lubricant 100...",
      price: 900,
      image: "https://via.placeholder.com/300?text=Lemon+Lubricant"
    },
    {
      id: "5",
      name: "Fist IT Butter",
      price: 1200,
      image: "https://via.placeholder.com/300?text=Fist+IT"
    }
  ]
};

function loadProducts() {
  products = categories[currentCategory] || [];
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
        ${inCart > 0 ? `
          <div class="quantity-controls">
            <button class="quantity-btn" onclick="changeQuantity('${product.id}', -1)">-</button>
            <div class="quantity-display">${inCart}</div>
            <button class="quantity-btn" onclick="changeQuantity('${product.id}', 1)">+</button>
          </div>
        ` : `
          <button class="add-btn" onclick="changeQuantity('${product.id}', 1)">Добавить</button>
        `}
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
    alert(`Заказ оформлен!\nТоваров: ${Object.values(cart).reduce((sum, item) => sum + item.quantity, 0)}`);
  }
}

function showCategory(category) {
  currentCategory = category;
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.includes(category === 'poppers' ? 'Каталог' : 'Корзина'));
  });
  loadProducts();
}

function showCart() {
  // Здесь можно реализовать просмотр корзины
  alert("Функция просмотра корзины будет реализована позже");
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCart();
});