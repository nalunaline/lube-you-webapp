const container = document.getElementById("product-list");
const cartCount = document.getElementById("cart-count");
const toast = document.getElementById("toast");

let cart = JSON.parse(localStorage.getItem('cart')) || {};
let products = [];

// Прямые данные для теста (чтобы избежать CORS)
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

function loadProducts() {
  try {
    console.log("Загрузка продуктов...");
    container.innerHTML = '<div class="loading">Загрузка товаров...</div>';
    
    // Используем прямые данные для теста
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
    console.log("Продукты загружены:", products);
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
          <button class="quantity-btn" onclick="changeQuantity('${product.id}', -1)">−</button>
          <span class="quantity">${cart[product.id]?.quantity || 0}</span>
          <button class="quantity-btn" onclick="changeQuantity('${product.id}', 1)">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

function changeQuantity(productId, delta) {
  try {
    const product = products.find(p => p.id === productId);
    if (!product) {
      console.error("Продукт не найден:", productId);
      showToast("Товар не найден");
      return;
    }

    if (!cart[productId]) {
      cart[productId] = { ...product, quantity: 0 };
    }

    cart[productId].quantity += delta;

    if (cart[productId].quantity <= 0) {
      delete cart[productId];
      showToast(`${product.name} удалён из корзины`);
    } else {
      showToast(delta > 0 ? `${product.name} добавлен в корзину` : `${product.name} удалён (1)`);
    }

    // Сохраняем корзину в localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Обновляем отображение
    updateCartCount();
    renderProducts(); // Перерисовываем, чтобы обновить количество
  } catch (error) {
    console.error("Ошибка изменения количества:", error);
    showToast("Ошибка при обновлении корзины");
  }
}

function updateCartCount() {
  try {
    const total = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = total;
  } catch (error) {
    console.error("Ошибка обновления счётчика корзины:", error);
    cartCount.textContent = '0';
  }
}

function showToast(message) {
  try {
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3000);
  } catch (error) {
    console.error("Ошибка отображения уведомления:", error);
  }
}

function openCart() {
  try {
    const items = Object.values(cart).map(item => ({
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
      console.log("Отправлены данные корзины:", items);
      showToast("Заказ отправлен");
    } else {
      console.log("Telegram Web App не доступен, данные:", items);
      showToast("Ошибка: Telegram Web App не доступен");
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