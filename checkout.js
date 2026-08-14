/* ==========================================================================
   MANIYAR STORE — js/checkout.js
   Renders the order summary from the cart, validates the delivery form,
   places the order (saved into localStorage "maniyar_orders" so it shows up
   in the admin dashboard), and builds the WhatsApp order message.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const grid = document.getElementById("checkoutGrid");
  const emptyEl = document.getElementById("checkoutEmpty");
  if (!grid) return;

  if (getCart().length === 0) {
    grid.classList.add("is-hidden");
    emptyEl.classList.remove("is-hidden");
    return;
  }

  renderCheckoutSummary();

  const form = document.getElementById("checkoutForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    placeOrder();
  });

  document.getElementById("whatsappOrderBtn").addEventListener("click", () => {
    if (!formIsFilled()) {
      form.reportValidity();
      return;
    }
    const order = placeOrder(true);
    if (order) {
      window.open(whatsappLink(buildWhatsAppMessage(order)), "_blank");
    }
  });
});

function renderCheckoutSummary() {
  const wrap = document.getElementById("checkoutItems");
  const lines = getCartDetailed();
  wrap.innerHTML = lines.map(line => {
    const price = line.product.discountPrice || line.product.price;
    return `<div class="checkout-item">
      <div><span class="name">${line.product.name} × ${line.qty}</span><div class="meta">${line.size} • ${line.color}</div></div>
      <div>${formatPrice(price * line.qty)}</div>
    </div>`;
  }).join("");

  const subtotal = getCartTotal();
  const shipping = subtotal > 0 && subtotal < 999 ? 79 : 0;
  document.getElementById("checkoutSubtotal").textContent = formatPrice(subtotal);
  document.getElementById("checkoutShipping").textContent = shipping === 0 ? "FREE" : formatPrice(shipping);
  document.getElementById("checkoutTotal").textContent = formatPrice(subtotal + shipping);
}

function formIsFilled() {
  return document.getElementById("checkoutForm").checkValidity();
}

function getCustomerFromForm() {
  return {
    name: document.getElementById("fullName").value.trim(),
    mobile: document.getElementById("mobile").value.trim(),
    address: document.getElementById("address").value.trim(),
    city: document.getElementById("city").value.trim(),
    pincode: document.getElementById("pincode").value.trim(),
    state: document.getElementById("state").value.trim(),
    notes: document.getElementById("notes").value.trim()
  };
}

let orderAlreadyPlaced = null;

function placeOrder(keepQuiet) {
  if (orderAlreadyPlaced) return orderAlreadyPlaced; // avoid double order if both buttons pressed
  const customer = getCustomerFromForm();
  const order = createOrder(customer);
  orderAlreadyPlaced = order;

  if (!keepQuiet) {
    document.getElementById("checkoutGrid").classList.add("is-hidden");
    document.getElementById("orderIdText").textContent = order.id;
    document.getElementById("orderSuccess").classList.remove("is-hidden");
  }
  return order;
}

function buildWhatsAppMessage(order) {
  const lines = order.items.map(i => `• ${i.name} (${i.size}, ${i.color}) x${i.qty} — ${formatPrice(i.price * i.qty)}`).join("\n");
  return `New Order from Maniyar Store website\n\n` +
    `Order ID: ${order.id}\n` +
    `Name: ${order.customer.name}\n` +
    `Mobile: ${order.customer.mobile}\n` +
    `Address: ${order.customer.address}, ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}\n` +
    (order.customer.notes ? `Notes: ${order.customer.notes}\n` : "") +
    `\nItems:\n${lines}\n\nTotal: ${formatPrice(order.total)}`;
}
