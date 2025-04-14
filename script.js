const container = document.getElementById("product-list");
const cartCount = document.getElementById("cart-count");
const toast = document.getElementById("toast");

let cart = JSON.parse(localStorage.getItem('cart')) || {};
let products = [];

// Прямые данные для теста
const directData = [
  {
    id: "1",
    name: "J-Lube Powder 7g",
    category: "Lubricants",
    description: "Powder for preparing lubricant and soap bubbles, 7g, universal",
    usage: "Intimate use, soap bubbles",
    price: 251,
    photo: "https://nalunaline.github.io/lube-you-webapp/assets/images/jlube28b.jpg"
  },
  {
    id: "2",
    name: "K-Lube Powder 18g",
    category: "Lubricants",
    description: "Powder for lubricant, 18g, suitable for massage and intimate use",
    usage: "Massage, intimate use",
    price: 549,
    photo: "https://nalunaline.github.io/lube-you-webapp/assets/images/jlube56b.jpg"
  },
  {
    id: "3",
    name: "J-Lube Powder 56g",
    category: "Lubricants",
    description: "Powder for lubricant, 56g, economical volume for regular use",
    usage: "Intimate, professional use",
    price: 521,
    photo: "https://nalunaline.github.io/lube-you-webapp/assets/images/jlube7.jpg"
  }
];

// Загрузка продуктов
function loadProducts() {
  try {
    container.innerHTML = '<div class="loading">Загрузка товаров...</div>';
    
    products = directData.map(item => ({
      id: item.id.toString(),
      name: item.name,
      category: item.category,
      description: item.description,
      usage: item.usage,
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

// Отображение продуктов
function renderProducts() {
  container.innerHTML = products.map(product => `
    <div class="product-card" data-id="${product.id}">
      <img src="${product.photo}" alt="${product.name}" 
           class="product-image" loading="lazy"
           onerror="this.src='https://via.placeholder.com/150'">
      <div class="product-info">
        <h3 class="product-title">${product.name}</h3>
        <div class="product-category">${product.category}</div>
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

// Изменение количества товара
function changeQuantity(productId, delta) {
  try {
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

    const newQuantity = cart[productId].quantity + delta;
    
    // Проверка на отрицательное количество
    if (newQuantity < 0) {
      showToast("Количество не может быть отрицательным");
      return;
    }

    cart[productId].quantity = newQuantity;

    // Удаляем товар если количество 0
    if (cart[productId].quantity === 0) {
      delete cart[productId];
      showToast(`${product.name} удалён из корзины`);
    } else {
      showToast(delta > 0 
        ? `${product.name} добавлен в корзину` 
        : `${product.name} удалён (1)`);
    }

    saveCart();
    updateCartCount();
    updateProductQuantity(productId);
  } catch (error) {
    console.error("Ошибка изменения количества:", error);
    showToast("Ошибка при обновлении корзины");
  }
}

// Обновление количества для конкретного товара (без полной перерисовки)
function updateProductQuantity(productId) {
  const quantityElement = document.querySelector(`.product-card[data-id="${productId}"] .quantity`);
  if (quantityElement) {
    quantityElement.textContent = cart[productId]?.quantity || 0;
  }
}

// Сохранение корзины
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Обновление счетчика корзины
function updateCartCount() {
  const total = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = total;
}

// Показ уведомления
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3000);
}

// Открытие корзины
function openCart() {
  try {
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
      window.Telegram.WebApp.sendData(JSON.stringify({ 
        items,
        total
      }));
      showToast("Заказ отправлен");
    } else {
      alert(message);
      console.log("Данные корзины:", { items, total });
      showToast("Заказ сформирован (тестовый режим)");
    }
  } catch (error) {
    console.error("Ошибка при открытии корзины:", error);
    showToast("Ошибка при отправке заказа");
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCartCount();
});