const container = document.getElementById("product-list");
const cartCount = document.getElementById("cart-count");
const toast = document.getElementById("toast");
const navButtons = document.querySelectorAll('.nav-btn');

let cart = JSON.parse(localStorage.getItem('cart')) || {};
let products = [];
let currentCategory = null;

const directData = [
  {
    id: "1",
    name: "J-Lube Powder 7g",
    category: "Lubricants",
    description: "Powder for preparing lubricant and soap bubbles, 7g, universal",
    price: 251,
    photo: "https://nalunaline.github.io/lube-you-webapp/assets/images/jlube28b.jpg"
  },
  {
    id: "2",
    name: "K-Lube Powder 18g",
    category: "Lubricants",
    description: "Powder for lubricant, 18g, suitable for massage and intimate use",
    price: 549,
    photo: "https://nalunaline.github.io/lube-you-webapp/assets/images/jlube56b.jpg"
  },
  {
    id: "3",
    name: "J-Lube Powder 56g",
    category: "Lubricants",
    description: "Powder for lubricant, 56g, economical volume for regular use",
    price: 521,
    photo: "https://nalunaline.github.io/lube-you-webapp/assets/images/jlube7.jpg"
  },
  {
    id: "4",
    name: "Sample Product",
    category: "Other",
    description: "Sample product from another category",
    price: 100,
    photo: "https://via.placeholder.com/150"
  }
];

function showCatalog() {
  // Show category selection if no category selected
  if (!currentCategory) {
    showCategories();
    return;
  }
  
  loadProducts();
  setActiveNavButton('Каталог');
}

function showCategories() {
  const categories = [...new Set(directData.map(item => item.category))];
  
  container.innerHTML = `
    <div class="category-selection">
      <h2>Выберите категорию</h2>
      <div class="category-list">
        ${categories.map(category => `
          <button class="category-btn" onclick="selectCategory('${category}')">
            ${category}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

function selectCategory(category) {
  currentCategory = category;
  loadProducts();
}

function setActiveNavButton(buttonText) {
  navButtons.forEach(btn => {
    btn.classList.toggle('active', btn.textContent.includes(buttonText));
  });
}

function loadProducts() {
  try {
    container.innerHTML = '<div class="loading">Загрузка товаров...</div>';
    
    products = directData
      .filter(item => !currentCategory || item.category === currentCategory)
      .map(item => ({
        id: item.id.toString(),
        name: item.name,
        category: item.category,
        description: item.description,
        price: Number(item.price),
        photo: item.photo || 'https://via.placeholder.com/150'
      }));
    
    renderProducts();
  } catch (error) {
    console.error("Ошибка загрузки:", error);
    container.innerHTML = `<div class="error">Ошибка загрузки товаров: ${error.message}</div>`;
    showToast("Ошибка загрузки данных");
  }
}

function renderProducts() {
  container.innerHTML = products.map(product => {
    const inCart = cart[product.id]?.quantity > 0;
    
    return `
      <div class="product-card" data-id="${product.id}">
        <img src="${product.photo}" alt="${product.name}" 
             class="product-image" loading="lazy"
             onerror="this.src='https://via.placeholder.com/150'">
        <div class="product-info">
          <h3 class="product-title">${product.name}</h3>
          <div class="product-price">${product.price}₽</div>
          <div class="product-description">${product.description}</div>
          <div class="product-controls">
            ${inCart ? `
              <div class="quantity-controls">
                <button class="quantity-btn" onclick="changeQuantity('${product.id}', -1)">-</button>
                <span class="quantity-value">${cart[product.id].quantity}</span>
                <button class="quantity-btn" onclick="changeQuantity('${product.id}', 1)">+</button>
              </div>
              <button class="manage-quantity-btn" onclick="removeFromCart('${product.id}')">
                Удалить
              </button>
            ` : `
              <button class="add-to-cart-btn" onclick="addToCart('${product.id}')">
                Добавить в корзину
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) {
    showToast("Товар не найден");
    return;
  }

  if (!cart[productId]) {
    cart[productId] = { 
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 0
    };
  }

  cart[productId].quantity += 1;
  showToast(`${product.name} добавлен в корзину`);

  saveCart();
  updateCartCount();
  animateAddToCart();
  renderProducts();
}

function changeQuantity(productId, change) {
  const product = products.find(p => p.id === productId);
  if (!product) {
    showToast("Товар не найден");
    return;
  }

  if (!cart[productId]) {
    if (change > 0) {
      cart[productId] = { 
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 0
      };
    } else {
      return;
    }
  }

  cart[productId].quantity += change;
  
  if (cart[productId].quantity <= 0) {
    removeFromCart(productId);
    return;
  }

  saveCart();
  updateCartCount();
  renderProducts();
}

function removeFromCart(productId) {
  if (cart[productId]) {
    const productName = cart[productId].name;
    delete cart[productId];
    showToast(`${productName} удален из корзины`);
    saveCart();
    updateCartCount();
    renderProducts();
  }
}

function animateAddToCart() {
  cartCount.classList.add('bounce');
  setTimeout(() => cartCount.classList.remove('bounce'), 500);
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
  const total = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = total;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3000);
}

function openCart() {
  setActiveNavButton('Корзина');
  
  const items = Object.values(cart);
  if (items.length === 0) {
    showToast("Корзина пуста");
    return;
  }

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const message = `Ваш заказ:\n${items.map(item => 
    `- ${item.name} (${item.quantity} × ${item.price}₽)`
  ).join('\n')}\n\nИтого: ${total}₽`;
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.sendData(JSON.stringify({ items, total }));
    showToast("Заказ отправлен");
  } else {
    alert(message);
    console.log("Данные корзины:", { items, total });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  showCategories();
  updateCartCount();
});