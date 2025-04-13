
const sheetUrl = "https://opensheet.elk.sh/2PACX-1vTQyyvsf636pYFNYDoLHF3rBnIY6YXAkXcVU7ot--JfO1a49fOeuYcfRtqfSOYA8vLojXhsIjLuTnbi/products";

const container = document.getElementById("product-container");
const cartCount = document.getElementById("cart-count");
const loader = document.getElementById("loader");

let cart = {};

function updateCartCount() {
  const total = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = total;
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast visible";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

fetch(sheetUrl)
  .then(res => res.json())
  .then(data => {
    loader.remove();
    data.forEach(product => {
      const card = document.createElement("div");
      card.className = "product-card";

      const img = document.createElement("img");
      img.src = product.Photo || "placeholder.png";
      img.alt = product.Name;
      img.className = "product-image";
      card.appendChild(img);

      const title = document.createElement("div");
      title.className = "product-title";
      title.textContent = product.Name;
      card.appendChild(title);

      const desc = document.createElement("div");
      desc.className = "product-description";
      desc.textContent = product.Description;
      card.appendChild(desc);

      const usage = document.createElement("div");
      usage.className = "product-usage";
      usage.textContent = product.Usage;
      card.appendChild(usage);

      const price = document.createElement("div");
      price.className = "product-price";
      price.textContent = `${product.Price}₽`;
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
    loader.remove();
    const error = document.createElement("div");
    error.textContent = "Ошибка загрузки данных";
    container.appendChild(error);
  });
