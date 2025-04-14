const container = document.getElementById("product-list");
const cartCount = document.getElementById("cart-count");
const toast = document.getElementById("toast");
const cartIcon = document.querySelector('.cart');

let cart = JSON.parse(localStorage.getItem('cart')) || {};
let products = [];
let scrollPosition = 0;

// Максимальное количество товара (можно задать для каждого товара индивидуально)
const MAX_QUANTITY = 10;

// Прямые данные для теста
const directData = [
  {
    id: "1",
    name: "J-Lube Powder 7g",
    category: "Lubricants",
    description: "Powder for preparing lubricant and soap bubbles, 7g, universal",
    usage: "Intimate use, soap bubbles",
    price: 251,
    photo: "https://nalunaline.github.io/lube-you-webapp/assets/images/jlube28b.jpg",
    maxQuantity: 5 // Индивидуальное ограничение для этого товара
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
      photo: item.photo || 'https://via.placeholder.com/150',
      maxQuantity: item.maxQuantity || MAX_QUANTITY // Устанавливаем лимит
    }));
    
    renderProducts();
    // Восстанавливаем позицию прокрутки после загрузки
    setTimeout(() => { window.scrollTo(0, scrollPosition); }, 0);
  } catch (error) {
    console.error("Ошибка загрузки:", error);
    container.innerHTML = `<div class="error">Ошибка загрузки товаров: ${error.message}</div>`;
    showToast("Ошибка загрузки данных");
  }
}

// Отображение продуктов
function renderProducts() {
  // Сохраняем позицию прокрутки перед обновлением
  scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  
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
  
  // Восстанавливаем позицию прокрутки после рендера
  setTimeout(() => { window.scrollTo(0, scrollPosition); }, 0);
}

// Изменение количества товара
function changeQuantity(productId, delta) {
  try {
    const product = products.find(p => p.id === productId);
    if (!product) {
      showToast("Товар не найден", 'error');
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
      showToast("Количество не может быть отрицательным", 'error');
      return;
    }
    
    // Проверка на максимальное количество
    if (newQuantity > product.maxQuantity) {
      showToast(`Максимальное количество: ${product.maxQuantity}`, 'error');
      return;
    }

    cart[productId].quantity = newQuantity;

    // Анимация добавления в корзину
    if (delta > 0) {
      animateAddToCart(productId);
    }

    // Удаляем товар если количество 0
    if (cart[productId].quantity === 0) {
      delete cart[productId];
      showToast(`${product.name} удалён из корзины`, 'info');
    } else {
      showToast(
        delta > 0 ? `${product.name} добавлен в корзину` : `${product.name} удалён (1)`,
        delta > 0 ? 'success' : 'info'
      );
    }

    saveCart();
    updateCartCount();
    updateProductQuantity(productId);
  } catch (error) {
    console.error("Ошибка изменения количества:", error);
    showToast("Ошибка при обновлении корзины", 'error');
  }
}

// Анимация добавления в корзину
function animateAddToCart(productId) {
  const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
  if (!productCard) return;
  
  const clone = productCard.cloneNode(true);
  clone.style.position = 'absolute';
  clone.style.top = `${productCard.getBoundingClientRect().top}px`;
  clone.style.left = `${productCard.getBoundingClientRect().left}px`;
  clone.style.width = `${productCard.offsetWidth}px`;
  clone.style.height = `${productCard.offsetHeight}px`;
  clone.style.zIndex = '1000';
  clone.style.transition = 'all 0.5s ease-in-out';
  clone.style.transformOrigin = 'center center';
  
  document.body.appendChild(clone);
  
  const cartRect = cartIcon.getBoundingClientRect();
  const cartCenterX = cartRect.left + cartRect.width / 2;
  const cartCenterY = cartRect.top + cartRect.height / 2;
  
  setTimeout(() => {
    clone.style.transform = `translate(${cartCenterX - clone.getBoundingClientRect().left}px, ${cartCenterY - clone.getBoundingClientRect().top}px) scale(0.1)`;
    clone.style.opacity = '0.5';
    
    setTimeout(() => {
      clone.remove();
      // Анимация иконки корзины
      cartIcon.classList.add('bounce');
      setTimeout(() => cartIcon.classList.remove('bounce'), 500);
    }, 500);
  }, 10);
}

// Обновление количества для конкретного товара
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
  
  // Анимация изменения количества
  if (total > 0) {
    cartCount.classList.add('pulse');
    setTimeout(() => cartCount.classList.remove('pulse'), 300);
  }
}

// Показ уведомления (теперь рядом с корзиной)
function showToast(message, type = 'info') {
  // Позиционируем уведомление рядом с корзиной
  const cartRect = cartIcon.getBoundingClientRect();
  toast.style.top = `${cartRect.bottom + window.scrollY + 10}px`;
  toast.style.left = `${cartRect.left}px`;
  toast.style.transform = 'translateX(0)';
  
  toast.textContent = message;
  toast.className = 'toast visible'; // Сбрасываем классы
  toast.classList.add(type); // Добавляем класс типа сообщения
  
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.className = 'toast', 300);
  }, 3000);
}

// Открытие корзины
function openCart() {
  try {
    const items = Object.values(cart);
    
    if (items.length === 0) {
      showToast("Корзина пуста", 'info');
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
      showToast("Заказ отправлен", 'success');
    } else {
      alert(message);
      console.log("Данные корзины:", { items, total });
      showToast("Заказ сформирован (тестовый режим)", 'success');
    }
  } catch (error) {
    console.error("Ошибка при открытии корзины:", error);
    showToast("Ошибка при отправке заказа", 'error');
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  updateCartCount();
  
  // Сохраняем позицию прокрутки перед обновлением страницы
  window.addEventListener('beforeunload', () => {
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  });
});