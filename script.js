async function loadProductsFromSheet() {
  const API_KEY = 'YOUR_API_KEY';
  const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
  const RANGE = 'Sheet1!A1:G100'; // Пример диапазона
  
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`
    );
    
    const data = await response.json();
    const [headers, ...rows] = data.values;
    
    products = rows.map(row => {
      const product = {};
      headers.forEach((header, i) => {
        product[header] = row[i];
      });
      return {
        id: product.ID.toString(),
        name: product.Name || "Без названия",
        category: product.Category || "Без категории",
        description: product.Description || "Нет описания",
        usage: product.Usage || "Нет информации",
        price: parseFloat(product.Price) || 0,
        photo: product.Photo || "https://via.placeholder.com/150?text=No+Image"
      };
    });
    
  } catch (error) {
    console.error("Ошибка при загрузке товаров:", error);
    throw error;
  }
}