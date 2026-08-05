let cart = JSON.parse(localStorage.getItem("cart")) || [];

export function addToCart(product) {

  const exist = cart.find(item => item.id === product.id);

  if (exist) {

    exist.quantity = (exist.quantity || 1) + 1;

  } else {

    cart.push({
      ...product,
      quantity: 1
    });

  }

  saveCart();

}

function saveCart() {

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  updateCartCount();

}

export function getCart() {

  return cart;

}

export function updateCartCount() {

  const count = document.getElementById("cart-count");

  if (!count) return;

  count.innerText = cart.reduce(
    (total, item) => total + (item.quantity || 1),
    0
  );

}

export function removeFromCart(id) {

  cart = cart.filter(item => item.id !== id);

  saveCart();

}

updateCartCount();
