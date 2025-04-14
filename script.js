const container = document.getElementById("product-list");
const cartCount = document.getElementById("cart-count");
const toast = document.getElementById("toast");

let cart = JSON.parse(localStorage.getItem('cart')) || {};
let products = [];

async function loadProducts() {
  try {
    // 1. Замените на ваш URL Apps Script
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby9NnBL39kI5AfM3a1p_ZVOSOawHRN-xSeG6kWtSCAQUwuRjuSgAo0mmK5oBTEnWn--QQ/exec';
    
    // 2. Добавляем индикатор загрузки
    container.innerHTML = '<div class="loading">Загрузка товаров...</div>';
    
    // 3. Запрос к Google Sheets
    const response = await fetch(SCRIPT_URL);
    if (!response.ok) throw new Error(`Ошибка HTTP: ${response.status}`);
    
    // 4. Обработка данных
    const { data } = await response.json();
    products = data.map(item => ({
      id: item.ID.toString(),
      name: item.Name,
      category: item.Category,
      description: item.Description,
      usage: item.Usage,
      price: Number(item.Price),
      photo: item.Photo || 'https://via.placeholder.com/150'
    }));
    
    // 5. Отображаем товары
    renderProducts();
    
  } catch (error) {
    console.error("Ошибка загрузки:", error);
    container.innerHTML = `<div class="error">Ошибка загрузки товаров: ${error.message}</div>`;
    showToast("Ошибка загрузки данных");
  }
}

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
          <button onclick="changeQuantity('${product.id}', -1)">−</button>
          <span class="quantity">${cart[product.id]?.quantity || 0}</span>
          <button onclick="changeQuantity('${product.id}', 1)">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCartCount();
});

// Остальные функции (changeQuantity, updateCartCount и т.д.) остаются без изменений