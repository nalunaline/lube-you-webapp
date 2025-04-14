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
    await loadProductsFromSheets();
    renderProducts(products);
  } catch (error) {
    console.error("Ошибка загрузки товаров:", error);
    showError("Ошибка загрузки товаров");
  }
}

// Загрузка товаров из Google Sheets
async function loadProductsFromSheets() {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${CONFIG.SPREADSHEET_ID}/values/${CONFIG.SHEET_NAME}!${CONFIG.RANGE}?key=${CONFIG.API_KEY}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.values || !Array.isArray(data.values)) {
      throw new Error("Некорректный формат данных");
    }
    
    // Преобразование данных таблицы в массив продуктов
    products = data.values.map((row, index) => ({
      id: row[0]?.toString() || `${index + 1}`,
      name: row[1] || "Без названия",
      category: row[2] || "Без категории",
      description: row[3] || "Нет описания",
      usage: row[4] || "Нет информации",
      price: parseFloat(row[5]) || 0,
      photo: validateImageUrl(row[6]) || "https://via.placeholder.com/150?text=No+Image"
    }));
    
    console.log("Успешно загружено товаров:", products.length);
  } catch (error) {
    console.error("Ошибка при загрузке из Google Sheets:", error);
    throw error;
  }
}

// Валидация URL изображения
function validateImageUrl(url) {
  if (!url) return null;
  try {
    new URL(url);
    return url;
  } catch {
    return null;
  }
}

// Показать сообщение об ошибке
function showError(message) {
  container.innerHTML = `<div class="error">${message}</div>`;
  showToast(message);
}

// Работа с корзиной
function updateCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const total = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = total || 0;
}

// Тема Telegram WebApp
function setupTheme() {
  if (!window.Telegram?.WebApp) return;
  
  const theme = window.Telegram.WebApp.colorScheme;
  document.body.classList.toggle('dark', theme === 'dark');
  
  window.Telegram.WebApp.onEvent('themeChanged', () => {
    const newTheme = window.Telegram.WebApp.colorScheme;
    document.body.classList.toggle('dark', newTheme === 'dark');
  });
}

// Открытие корзины
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
      cart = {};
      updateCart();
    } catch (e) {
      console.error("Ошибка отправки данных:", e);
      showToast("Ошибка отправки заказа");
    }
  } else {
    console.log("Данные заказа (тест):", { items });
    showToast("Режим тестирования: заказ не отправлен");
  }
}

// Рендеринг товаров
function renderProducts(products) {
  if (!products?.length) {
    showError("Товары не найдены");
    return;
  }

  container.innerHTML = products.map(product => `
    <div class="product-card" data-id="${product.id}">
      <img src="${product.photo}" alt="${product.name}" class="product-image" 
           loading="lazy" onerror="this.src='https://via.placeholder.com/150?text=No+Image'">
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
  if (!cart[productId]) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    cart[productId] = { ...product, quantity: 0 };
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

// Обновление количества товара
function updateProductQuantity(productId) {
  const quantityElement = container.querySelector(`.product-card[data-id="${productId}"] .quantity`);
  if (quantityElement) {
    quantityElement.textContent = cart[productId]?.quantity || 0;
  }
}

// Показать уведомление
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 3000);
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);

// Глобальные функции для HTML
window.changeQuantity = changeQuantity;
window.openCart = openCart;