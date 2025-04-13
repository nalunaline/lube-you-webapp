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