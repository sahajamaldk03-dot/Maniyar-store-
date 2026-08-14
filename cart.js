/* ==========================================================================
   MANIYAR STORE — js/cart.js
   Cart data logic (localStorage). Loaded on every page after products.js.
   Cart-PAGE-specific rendering (for cart.html) is at the bottom of this file,
   guarded so it only runs when cart.html's elements exist.
   ========================================================================== */

function getCart() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.CART)) || []; }
  catch (e) { return []; }
}

function saveCart(cart) {
  localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, size, color, qty) {
  const cart = getCart();
  const existing = cart.find(i => i.productId === productId && i.size === size && i.color === color);
  if (existing) existing.qty += qty;
  else cart.push({ productId, size, color, qty });
  saveCart(cart);
}

function removeCartLine(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
}

function setCartLineQty(index, qty) {
  const cart = getCart();
  if (cart[index]) {
    cart[index].qty = Math.max(1, Number(qty) || 1);
    saveCart(cart);
  }
}

function getCartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

function getCartDetailed() {
  return getCart().map((item, index) => {
    const product = getProductById(item.productId);
    return { ...item, index, product };
  }).filter(line => line.product);
}

function getCartTotal() {
  return getCartDetailed().reduce((sum, line) => sum + (line.product.discountPrice || line.product.price) * line.qty, 0);
}

function clearCart() {
  saveCart([]);
}

function updateCartBadge() {
  document.querySelectorAll(".js-cart-count").forEach(el => {
    const count = getCartCount();
    el.textContent = count;
    el.classList.toggle("is-hidden", count === 0);
  });
}

/* ---------------- CART PAGE RENDERING (cart.html only) ---------------- */
function renderCartPage() {
  const listEl = document.getElementById("cart-list");
  const emptyEl = document.getElementById("cart-empty");
  const summaryEl = document.getElementById("cart-summary");
  if (!listEl) return; // not on cart.html

  const lines = getCartDetailed();

  if (lines.length === 0) {
    listEl.innerHTML = "";
    emptyEl.classList.remove("is-hidden");
    if (summaryEl) summaryEl.classList.add("is-hidden");
    return;
  }

  emptyEl.classList.add("is-hidden");
  if (summaryEl) summaryEl.classList.remove("is-hidden");

  listEl.innerHTML = lines.map(line => {
    const price = line.product.discountPrice || line.product.price;
    return `
    <div class="cart-line" data-index="${line.index}">
      <a href="product.html?id=${line.product.id}"><img src="${line.product.image}" alt="${line.product.name}" class="cart-line__img"></a>
      <div class="cart-line__info">
        <a href="product.html?id=${line.product.id}" class="cart-line__name">${line.product.name}</a>
        <p class="cart-line__meta">Size: ${line.size} &nbsp;•&nbsp; Color: ${line.color}</p>
        <p class="cart-line__price">${formatPrice(price)}</p>
        <div class="qty-control">
          <button class="qty-btn" onclick="changeCartQty(${line.index}, -1)" aria-label="Decrease quantity">−</button>
          <input type="number" min="1" value="${line.qty}" class="qty-input" onchange="setCartQtyFromInput(${line.index}, this.value)">
          <button class="qty-btn" onclick="changeCartQty(${line.index}, 1)" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <button class="cart-line__remove" onclick="removeCartLineUI(${line.index})" aria-label="Remove item">
        <svg viewBox="0 0 24 24" width="20" height="20"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </div>`;
  }).join("");

  const subtotal = getCartTotal();
  const shipping = subtotal > 0 && subtotal < 999 ? 79 : 0;
  const total = subtotal + shipping;

  document.getElementById("cart-subtotal").textContent = formatPrice(subtotal);
  document.getElementById("cart-shipping").textContent = shipping === 0 ? "FREE" : formatPrice(shipping);
  document.getElementById("cart-total").textContent = formatPrice(total);
}

function changeCartQty(index, delta) {
  const cart = getCart();
  if (cart[index]) setCartLineQty(index, cart[index].qty + delta);
  renderCartPage();
}

function setCartQtyFromInput(index, value) {
  setCartLineQty(index, value);
  renderCartPage();
}

function removeCartLineUI(index) {
  removeCartLine(index);
  renderCartPage();
  showToast("Item removed from cart");
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  renderCartPage();
});

/* ==========================================================================
   ORDERS — created at checkout, read/managed from the admin dashboard.
   Stored in localStorage under "maniyar_orders".
   ========================================================================== */

function getOrders() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS)) || []; }
  catch (e) { return []; }
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

function createOrder(customer) {
  const orders = getOrders();
  const items = getCartDetailed().map(line => ({
    productId: line.product.id,
    name: line.product.name,
    size: line.size,
    color: line.color,
    qty: line.qty,
    price: line.product.discountPrice || line.product.price
  }));
  const subtotal = getCartTotal();
  const shipping = subtotal > 0 && subtotal < 999 ? 79 : 0;
  const order = {
    id: "MS" + Date.now(),
    date: new Date().toISOString(),
    customer,
    items,
    subtotal,
    shipping,
    total: subtotal + shipping,
    status: "Pending"
  };
  orders.push(order);
  saveOrders(orders);

  // Reduce stock for each purchased item
  const products = getProducts();
  items.forEach(i => {
    const p = products.find(pr => pr.id === i.productId);
    if (p) p.stock = Math.max(0, Number(p.stock) - i.qty);
  });
  saveProducts(products);

  clearCart();
  return order;
}

function updateOrderStatus(orderId, status) {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (order) { order.status = status; saveOrders(orders); }
}

function deleteOrder(orderId) {
  saveOrders(getOrders().filter(o => o.id !== orderId));
}
