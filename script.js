const sheetUrl = "https://opensheet.elk.sh/2PACX-1vTQyyvsf636pYFNYDoLHF3rBnIY6YXAkXcVU7ot--JfO1a49fOeuYcfRtqfSOYA8vLojXhsIjLuTnbi/products";

const container = document.getElementById("product-list");
const cartCount = document.getElementById("cart-count");

let cart = {};

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
  }
}

if (!container) {
  console.error("Контейнер product-list не найден");
} else {
  container.innerHTML = "<div>Загрузка...</div>";
  fetch(sheetUrl)
    .then(res => {
      if (!res.ok) throw new Error("Ошибка загрузки данных");
      return res.json();
    })
    .then(data => {
      container.innerHTML = "";
      if (!data || data.length === 0) {
        container.innerHTML = "<div>Товары не найдены</div>";
        return;
      }
      data.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        const img = document.createElement("img");
        img.src = product.Photo || "placeholder.png";
        img.alt = product.Name || "Товар";
        img.className = "product-image";
        card.appendChild(img);

        const title = document.createElement("div");
        title.className = "product-title";
        title.textContent = product.Name || "Без названия";
        card.appendChild(title);

        const desc = document.createElement("div");
        desc.className = "product-description";
        desc.textContent = product.Description || "";
        card.appendChild(desc);

        const usage = document.createElement("div");
        usage.className = "product-usage";
        usage.textContent = product.Usage || "";
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
          }
          updateCartCount();
          qty.textContent = cart[product.ID]?.quantity || 0;
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
    })
    .catch(err => {
      container.innerHTML = "<div>Ошибка загрузки данных</div>";
      console.error(err);
    });
}