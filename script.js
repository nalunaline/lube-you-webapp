// Временная заглушка, так как таблица не настроена
// После настройки листа `products` замени на:
// const sheetUrl = "https://opensheet.elk.sh/1F56d-u8LBJw7xy2b3gr9eAB4sjUtkowbMg7Dir3rTjY/products";
const sheetUrl = "https://opensheet.elk.sh/1F56d-u8LBJw7xy2b3gr9eAB4sjUtkowbMg7Dir3rTjY/Sheet1";

const container = document.getElementById("product-list");
const cartCount = document.getElementById("cart-count");

let cart = {};

// Тестовые данные на случай ошибки с таблицей
const fallbackData = [
  {
    ID: "1",
    Name: "Тестовый товар 1",
    Photo: "https://via.placeholder.com/150",
    Description: "Описание тестового товара 1",
    Usage: "Использование тестового товара 1",
    Price: "100"
  },
  {
    ID: "2",
    Name: "Тестовый товар 2",
    Photo: "https://via.placeholder.com/150",
    Description: "Описание тестового товара 2",
    Usage: "Использование тестового товара 2",
    Price: "200"
  }
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
    img.src = product.Photo || "https://via.placeholder.com/150";
    img.alt = product.Name || "Товар";
    img.className = "product-image";
    img.onerror = () => { img.src = "https://via.placeholder.com/150"; };
    card.appendChild(img);

    const title = document.createElement("div");
    title.className = "product-title";
    title.textContent = product.Name || "Без названия";
    card.appendChild(title);

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
  container.innerHTML = "<div>Загрузка товаров...</div>";
  fetch(sheetUrl)
    .then(res => {
      if (!res.ok) throw new Error(`Ошибка HTTP: ${res.status}`);
      return res.json();
    })
    .then(data => {
      if (data.error) {
        console.error("Ошибка таблицы:", data.error);
        container.innerHTML = "<div>Ошибка загрузки товаров. Используются тестовые данные.</div>";
        renderProducts(fallbackData);
      } else {
        renderProducts(data);
      }
    })
    .catch(err => {
      console.error("Ошибка загрузки данных:", err);
      container.innerHTML = "<div>Ошибка загрузки товаров. Используются тестовые данные.</div>";
      renderProducts(fallbackData);
    });
}