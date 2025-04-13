const container = document.getElementById("product-list");
const cartCount = document.getElementById("cart-count");

let cart = {};

// Данные напрямую из Google Sheets
const directData = [
  {"ID":"1","Name":"J-Lube Powder 7g","Category":"Lubricants","Description":"Powder for preparing lubricant and soap bubbles, 7g, universal","Usage":"Intimate use, soap bubbles","Price":"251","Photo":"https://nalunaline.github.io/lube-you-webapp/assets/images/jlube28b.jpg"},
  {"ID":"2","Name":"K-Lube Powder 18g","Category":"Lubricants","Description":"Powder for lubricant, 18g, suitable for massage and intimate use","Usage":"Massage, intimate use","Price":"549","Photo":"https://nalunaline.github.io/lube-you-webapp/assets/images/jlube56b.jpg"},
  {"ID":"3","Name":"J-Lube Powder 56g","Category":"Lubricants","Description":"Powder for lubricant, 56g, economical volume for regular use","Usage":"Intimate, professional use","Price":"521","Photo":"https://nalunaline.github.io/lube-you-webapp/assets/images/jlube7.jpg"}
];

function updateCartCount() {
  const total = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = total;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 3000);
}

function openCart() {
  const items = Object.values(cart).map(item => ({
    title: item.Name,
    price: parseFloat(item.Price.replace(/[^0-9.]/g, '')) || 0,
    quantity: item.quantity
  }));
  if (items.length === 0) {
    showToast("Корзина пуста");
    return;
  }
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.sendData(JSON.stringify({ items }));
  } else {
    console.log("Telegram Web App не доступен, данные:", { items });
    showToast("Ошибка: Telegram Web App не доступен");
  }
}

function renderProducts(data) {
  console.log("Вызов renderProducts с данными:", data);
  container.innerHTML = "";
  if (!data || data.length === 0) {
    container.innerHTML = "<div>Товары не найдены.</div>";
    console.warn("Данные пусты");
    return;
  }
  data.forEach(product => {
    if (!product.ID || !product.Name) {
      console.warn("Некорректные данные продукта:", product);
      return;
    }
    const card = document.createElement("div");
    card.className = "product-card";

    const img = document.createElement("img");
    const baseUrl = "https://nalunaline.github.io/lube-you-webapp/";
    img.src = product.Photo.startsWith("http") ? product.Photo : baseUrl + product.Photo;
    img.alt = product.Name || "Товар";
    img.className = "product-image";
    img.onerror = () => { img.src = "https://via.placeholder.com/150"; };
    card.appendChild(img);

    const title = document.createElement("div");
    title.className = "product-title";
    title.textContent = product.Name || "Без названия";
    card.appendChild(title);

    const category = document.createElement("div");
    category.className = "product-category";
    category.textContent = product.Category || "Без категории";
    card.appendChild(category);

    const desc = document.createElement("div");
    desc.className = "product-description";
    desc.textContent = product.Description || "Нет описания";
    card.appendChild(desc);

    const usage = document.createElement("div");
    usage.className = "product-usage";
    usage.textContent = product.Usage || "Нет информации";
    card.appendChild(usage);

    const price = document.createElement("div");
    price.className = "product-price";
    price.textContent = `${product.Price || 0}₽`;
    card.appendChild(price);

    const controls = document.createElement("div");
    controls.className = "product-controls";

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "−";
    removeBtn.onclick = () => {
      if (cart[product.ID]) {
        cart[product.ID].quantity--;
        if (cart[product.ID].quantity <= 0) delete cart[product.ID];
        updateCartCount();
        qty.textContent = cart[product.ID]?.quantity || 0;
      }
    };
    controls.appendChild(removeBtn);

    const qty = document.createElement("div");
    qty.className = "quantity";
    qty.textContent = cart[product.ID]?.quantity || 0;
    controls.appendChild(qty);

    const addBtn = document.createElement("button");
    addBtn.textContent = "+";
    addBtn.onclick = () => {
      if (!cart[product.ID]) {
        cart[product.ID] = { ...product, quantity: 0 };
      }
      cart[product.ID].quantity++;
      updateCartCount();
      qty.textContent = cart[product.ID].quantity;
      showToast("Добавлено в корзину");
    };
    controls.appendChild(addBtn);

    card.appendChild(controls);
    container.appendChild(card);
  });
}

if (!container) {
  console.error("Контейнер product-list не найден");
} else {
  console.log("Используем прямые данные для теста...");
  container.innerHTML = "<div>Загрузка товаров...</div>";
  setTimeout(() => {
    renderProducts(directData);
  }, 1000);
}