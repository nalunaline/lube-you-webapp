async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    const { products, categories } = await response.json();
    
    // Render category filter
    const categoryFilter = document.createElement('div');
    categoryFilter.className = 'category-filter';
    categoryFilter.innerHTML = `
      <button class="category-btn active" data-category="all">All</button>
      ${categories.map(cat => `
        <button class="category-btn" data-category="${cat}">${cat}</button>
      `).join('')}
    `;
    container.before(categoryFilter);

    // Render products
    container.innerHTML = products.map(product => `
      <div class="product-card" data-id="${product.id}" data-category="${product.category}">
        <img src="${product.image_url}" alt="${product.name}" class="product-image">
        <h3>${product.name}</h3>
        <div class="price">${product.price} RUB</div>
        <div class="stock">In stock: ${product.stock}</div>
        <button class="add-to-cart">Add to cart</button>
      </div>
    `).join('');
    
    // Add event listeners
    document.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        filterProducts(category);
      });
    });
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

function filterProducts(category) {
  document.querySelectorAll('.product-card').forEach(card => {
    card.style.display = (category === 'all' || card.dataset.category === category) 
      ? 'block' 
      : 'none';
  });
}