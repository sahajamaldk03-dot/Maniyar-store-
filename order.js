export function buyProduct(product) {

  const phone = "918779716804";

  const message = `🛍️ MANIYAR STORE

Hello,

I want to place a Cash On Delivery (COD) order.

📦 Product: ${product.name}

💰 Price: ₹${product.price}

📂 Category: ${product.category}

Payment: Cash On Delivery (COD)

Please confirm my order. Thank you.`;

  const url =
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  window.open(url, "_blank");

}
