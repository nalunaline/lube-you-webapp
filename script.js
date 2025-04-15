// Инициализация WebApp
if (window.Telegram?.WebApp) {
  Telegram.WebApp.expand();
  Telegram.WebApp.MainButton.setText('Оформить заказ');
  Telegram.WebApp.MainButton.show();
}
const API_URL = 'https://script.google.com/macros/s/AKfycbxJKno6H5HC8t6dZty-Ui16yhjKV7EMnyeoYj2MGQXk6tjPOTnsy8k6nR9TwB4MW6JiIw/exec';

class Cart {
  constructor() {
    this.items = JSON.parse(localStorage.getItem('cart')) || {};
  }

  async sendOrder() {
    const items = Object.values(this.items);
    if (items.length === 0) return false;

    const orderData = {
      user_id: window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 'web_user',
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total: items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      
      const result = await response.json();
      if (result.success) {
        this.clear();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Order submit error:', error);
      return false;
    }
  }

  clear() {
    this.items = {};
    localStorage.removeItem('cart');
    updateCartCount();
  }
}

async function openCart() {
  if (Object.keys(window.cart.items).length === 0) {
    showToast('Корзина пуста');
    return;
  }

  if (window.Telegram?.WebApp) {
    try {
      const success = await window.cart.sendOrder();
      if (success) {
        Telegram.WebApp.sendData(JSON.stringify(window.cart.items));
        showToast('Заказ оформлен!');
      } else {
        showToast('Ошибка сохранения заказа');
      }
    } catch (error) {
      console.error('WebApp error:', error);
      showToast('Ошибка: ' + error.message);
    }
  } else {
    const success = await window.cart.sendOrder();
    showToast(success ? 'Заказ сохранён!' : 'Ошибка сохранения');
  }
}