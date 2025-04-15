const API_URL = 'https://script.google.com/macros/s/AKfycbxeQ_vwEUyGKz8XMPK8NM3MI5OsdlDQmUQ700JfweqQi96c_NlDSN3qENyNaltgbrCZ9w/exec';

class ProductAPI {
  static async getProducts(category = null) {
    try {
      let url = `${API_URL}?sheetName=Products`;
      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown API error');
      }

      // Преобразование данных в единый формат
      return data.data.map(item => ({
        id: item.id?.toString() || '',
        name: item.name || 'No Name',
        price: parseFloat(item.price) || 0,
        category: item.category || 'uncategorized',
        image: item.image_url || item.image || './img/no-image.jpg',
        description: item.description || '',
        stock: parseInt(item.stock) || 0
      }));
    } catch (error) {
      console.error('Failed to load products:', error);
      showToast('Ошибка загрузки товаров');
      return [];
    }
  }

  static async getCategories() {
    try {
      const response = await fetch(`${API_URL}?sheetName=Categories`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load categories');
      }

      // Извлекаем уникальные категории из товаров, если лист Categories пуст
      if (!data.data || data.data.length === 0) {
        const products = await this.getProducts();
        return [...new Set(products.map(p => p.category))];
      }

      return data.data.map(c => c.name).filter(Boolean);
    } catch (error) {
      console.error('Failed to load categories:', error);
      return ['Все товары'];
    }
  }

  static async sendOrder(orderData) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sheetName: 'Orders',
          ...orderData
        })
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Order failed');
      }

      return result;
    } catch (error) {
      console.error('Order submission failed:', error);
      throw error;
    }
  }
}

// Пример использования
class ProductRenderer {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem('cart')) || {};
    this.currentCategory = 'all';
  }

  async init() {
    await this.renderCategories();
    await this.renderProducts();
    this.setupEventListeners();
  }

  async renderCategories() {
    const categories = await ProductAPI.getCategories();
    const container = document.querySelector('.category-filter') || document.createElement('div');
    container.className = 'category-filter';
    
    container.innerHTML = `
      <button class="category-btn ${this.currentCategory === 'all' ? 'active' : ''}" 
              data-category="all">Все товары</button>
      ${categories.map(cat => `
        <button class="category-btn ${this.currentCategory === cat ? 'active' : ''}" 
                data-category="${cat}">${cat}</button>
      `).join('')}
    `;

    if (!document.querySelector('.category-filter')) {
      document.querySelector('main').prepend(container);
    }
  }

  async renderProducts() {
    const products = await ProductAPI.getProducts(
      this.currentCategory === 'all' ? null : this.currentCategory
    );

    const productsContainer = document.getElementById('product-list');
    productsContainer.innerHTML = products.map(product => `
      <div class="product-card" data-id="${product.id}" data-category="${product.category}">
        <img src="${product.image}" alt="${product.name}" 
             onerror="this.src='./img/no-image.jpg'" 
             class="product-image">
        <h3 class="product-title">${product.name}</h3>
        <div class="product-price">${product.price.toFixed(2)} ₽</div>
        ${product.stock > 0 ? `
          <div class="product-stock">В наличии: ${product.stock}</div>
          ${this.getProductControls(product.id)}
        ` : `
          <div class="out-of-stock">Нет в наличии</div>
        `}
      </div>
    `).join('');
  }

  getProductControls(productId) {
    const inCart = this.cart[productId]?.quantity || 0;
    
    return inCart > 0 ? `
      <div class="quantity-controls">
        <button class="quantity-btn" onclick="productRenderer.changeQuantity('${productId}', -1)">-</button>
        <div class="quantity-value">${inCart}</div>
        <button class="quantity-btn" onclick="productRenderer.changeQuantity('${productId}', 1)">+</button>
      </div>
      <button class="remove-btn" onclick="productRenderer.removeFromCart('${productId}')">
        Удалить
      </button>
    ` : `
      <button class="add-btn" onclick="productRenderer.addToCart('${productId}')">
        Добавить в корзину
      </button>
    `;
  }

  // ... остальные методы класса (addToCart, changeQuantity и т.д.)
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  window.productRenderer = new ProductRenderer();
  productRenderer.init();
});