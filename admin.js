/* ==========================================================================
   MANIYAR STORE — js/admin.js
   Admin dashboard: simple password login, dashboard stats, product CRUD,
   and order management. All data lives in localStorage (see products.js /
   cart.js for the storage helpers). To move to a real database, see
   js/firebase.js.
   ========================================================================== */

/* TODO: change this password. This is a basic client-side lock for your own
   convenience while editing the site — NOT real security. Anyone who reads
   this file's source can see the password. For real protection, use
   Firebase Authentication (see js/firebase.js). */
const ADMIN_PASSWORD = "maniyar123";

document.addEventListener("DOMContentLoaded", () => {
  initLogin();
  initSidebarNav();
  initProductModal();
  initOrderModal();
  renderAll();
});

/* ---------------- LOGIN ---------------- */
function initLogin() {
  const loginScreen = document.getElementById("adminLogin");
  const app = document.getElementById("adminApp");
  const passwordInput = document.getElementById("adminPassword");
  const loginBtn = document.getElementById("adminLoginBtn");
  const errorEl = document.getElementById("adminLoginError");
  const logoutBtn = document.getElementById("logoutBtn");

  function showApp() {
    loginScreen.style.display = "none";
    app.classList.add("is-visible");
    renderAll();
  }

  if (sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === "true") {
    showApp();
  }

  loginBtn.addEventListener("click", attemptLogin);
  passwordInput.addEventListener("keydown", e => { if (e.key === "Enter") attemptLogin(); });

  function attemptLogin() {
    if (passwordInput.value === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, "true");
      errorEl.textContent = "";
      showApp();
    } else {
      errorEl.textContent = "Incorrect password. Please try again.";
    }
  }

  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    location.reload();
  });
}

/* ---------------- SIDEBAR NAV ---------------- */
function initSidebarNav() {
  const links = document.querySelectorAll(".admin-nav a");
  const sections = document.querySelectorAll(".admin-section");
  const title = document.getElementById("sectionTitle");
  const sidebar = document.getElementById("adminSidebar");
  const toggle = document.getElementById("sidebarToggle");
  const backdrop = document.getElementById("sidebarBackdrop");

  links.forEach(link => {
    link.addEventListener("click", () => {
      links.forEach(l => l.classList.remove("is-active"));
      link.classList.add("is-active");
      const sectionId = "section-" + link.dataset.section;
      sections.forEach(s => s.classList.toggle("is-active", s.id === sectionId));
      title.textContent = link.textContent.replace(/^\S+\s/, "");
      sidebar.classList.remove("is-open");
      backdrop.classList.remove("is-open");
      renderAll();
    });
  });

  toggle && toggle.addEventListener("click", () => {
    sidebar.classList.add("is-open");
    backdrop.classList.add("is-open");
  });
  backdrop && backdrop.addEventListener("click", () => {
    sidebar.classList.remove("is-open");
    backdrop.classList.remove("is-open");
  });
}

function renderAll() {
  renderDashboardStats();
  renderProductsTable();
  renderOrdersTable();
  bindToolbarSearch();
}

/* ==========================================================================
   DASHBOARD
   ========================================================================== */
function renderDashboardStats() {
  const statProducts = document.getElementById("statProducts");
  if (!statProducts) return;
  const products = getProducts();
  const orders = getOrders();
  const pending = orders.filter(o => o.status === "Pending").length;
  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  statProducts.textContent = products.length;
  document.getElementById("statOrders").textContent = orders.length;
  document.getElementById("statPending").textContent = pending;
  document.getElementById("statSales").textContent = formatPrice(totalSales);

  const statuses = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"];
  const chartWrap = document.getElementById("statusChart");
  const maxCount = Math.max(1, ...statuses.map(s => orders.filter(o => o.status === s).length));
  chartWrap.innerHTML = statuses.map(s => {
    const count = orders.filter(o => o.status === s).length;
    const pct = Math.round((count / maxCount) * 100);
    return `<div class="bar-row">
      <div class="bar-label">${s}</div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;"></div></div>
      <div class="bar-value">${count}</div>
    </div>`;
  }).join("");

  const recentBody = document.getElementById("recentOrdersBody");
  const recent = [...orders].reverse().slice(0, 6);
  recentBody.innerHTML = recent.length ? recent.map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${o.customer.name}</td>
      <td>${formatPrice(o.total)}</td>
      <td><span class="status-pill status-${o.status}">${o.status}</span></td>
    </tr>`).join("") : `<tr><td colspan="4" style="color:#999;">No orders yet.</td></tr>`;
}

/* ==========================================================================
   PRODUCTS
   ========================================================================== */
let productSearchTerm = "";
let orderSearchTerm = "";

function bindToolbarSearch() {
  const ps = document.getElementById("productSearch");
  const os = document.getElementById("orderSearch");
  if (ps && !ps._bound) {
    ps._bound = true;
    ps.addEventListener("input", () => { productSearchTerm = ps.value.toLowerCase(); renderProductsTable(); });
  }
  if (os && !os._bound) {
    os._bound = true;
    os.addEventListener("input", () => { orderSearchTerm = os.value.toLowerCase(); renderOrdersTable(); });
  }
}

function renderProductsTable() {
  const body = document.getElementById("productsTableBody");
  if (!body) return;
  let products = getProducts();
  if (productSearchTerm) {
    products = products.filter(p => p.name.toLowerCase().includes(productSearchTerm) || p.category.toLowerCase().includes(productSearchTerm));
  }

  body.innerHTML = products.length ? products.map(p => {
    const stockClass = p.stock <= 0 ? "stock-out" : p.stock <= 5 ? "stock-low" : "stock-ok";
    const stockLabel = p.stock <= 0 ? "Out of stock" : p.stock <= 5 ? "Low stock" : "In stock";
    return `
    <tr>
      <td><img src="${p.image}" alt="${p.name}"></td>
      <td>${p.name}</td>
      <td>${p.category}</td>
      <td>${formatPrice(p.price)}</td>
      <td>${p.discountPrice ? formatPrice(p.discountPrice) : "—"}</td>
      <td>
        <input type="number" min="0" value="${p.stock}" style="width:60px;padding:5px;border-radius:6px;border:1px solid #e7e7ea;" onchange="quickUpdateStock(${p.id}, this.value)">
        <div><span class="stock-badge ${stockClass}">${stockLabel}</span></div>
      </td>
      <td>
        <button class="btn-admin outline small" onclick="openProductModal(${p.id})">Edit</button>
        <button class="btn-admin danger small" onclick="deleteProductUI(${p.id})">Delete</button>
      </td>
    </tr>`;
  }).join("") : `<tr><td colspan="7" style="color:#999;">No products found.</td></tr>`;
}

function quickUpdateStock(productId, value) {
  const products = getProducts();
  const p = products.find(pr => pr.id === productId);
  if (p) { p.stock = Math.max(0, Number(value) || 0); saveProducts(products); renderProductsTable(); renderDashboardStats(); }
}

function deleteProductUI(productId) {
  if (!confirm("Delete this product? This cannot be undone.")) return;
  saveProducts(getProducts().filter(p => p.id !== productId));
  renderProductsTable();
  renderDashboardStats();
}

/* ---------------- PRODUCT MODAL (Add / Edit) ---------------- */
let uploadedImages = []; // extra images from file upload, base64 data URLs

function initProductModal() {
  const modal = document.getElementById("productModal");
  const backdrop = document.getElementById("productModalBackdrop");
  const closeBtn = document.getElementById("productModalClose");
  const cancelBtn = document.getElementById("productCancelBtn");
  const addBtn = document.getElementById("addProductBtn");
  const form = document.getElementById("productForm");
  const fileInput = document.getElementById("pf_imageFile");

  const close = () => modal.classList.remove("is-open");
  backdrop.addEventListener("click", close);
  closeBtn.addEventListener("click", close);
  cancelBtn.addEventListener("click", close);
  addBtn.addEventListener("click", () => openProductModal(null));

  fileInput.addEventListener("change", () => {
    const files = Array.from(fileInput.files || []);
    uploadedImages = [];
    const preview = document.getElementById("imagePreviewRow");
    preview.innerHTML = "";
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        uploadedImages.push(reader.result);
        const img = document.createElement("img");
        img.src = reader.result;
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    saveProductFromForm();
    close();
  });
}

function openProductModal(productId) {
  const modal = document.getElementById("productModal");
  const title = document.getElementById("productModalTitle");
  uploadedImages = [];
  document.getElementById("imagePreviewRow").innerHTML = "";
  document.getElementById("pf_imageFile").value = "";

  if (productId) {
    const p = getProductById(productId);
    title.textContent = "Edit Product";
    document.getElementById("pf_id").value = p.id;
    document.getElementById("pf_name").value = p.name;
    document.getElementById("pf_category").value = p.category;
    document.getElementById("pf_gender").value = p.gender || "Men";
    document.getElementById("pf_price").value = p.price;
    document.getElementById("pf_discountPrice").value = p.discountPrice || "";
    document.getElementById("pf_stock").value = p.stock;
    document.getElementById("pf_rating").value = p.rating || 4.5;
    document.getElementById("pf_sizes").value = p.sizes.join(", ");
    document.getElementById("pf_colors").value = p.colors.join(", ");
    document.getElementById("pf_description").value = p.description || "";
    document.getElementById("pf_imageUrl").value = p.image || "";
  } else {
    title.textContent = "Add Product";
    document.getElementById("productForm").reset();
    document.getElementById("pf_id").value = "";
  }
  modal.classList.add("is-open");
}

function saveProductFromForm() {
  const id = document.getElementById("pf_id").value;
  const products = getProducts();

  const sizes = document.getElementById("pf_sizes").value.split(",").map(s => s.trim()).filter(Boolean);
  const colors = document.getElementById("pf_colors").value.split(",").map(s => s.trim()).filter(Boolean);
  const imageUrl = document.getElementById("pf_imageUrl").value.trim();
  const mainImage = imageUrl || uploadedImages[0] || "https://placehold.co/600x750/cccccc/ffffff?text=Product";
  const allImages = [mainImage, ...uploadedImages.filter(i => i !== mainImage)];

  const data = {
    name: document.getElementById("pf_name").value.trim(),
    category: document.getElementById("pf_category").value,
    gender: document.getElementById("pf_gender").value,
    price: Number(document.getElementById("pf_price").value) || 0,
    discountPrice: Number(document.getElementById("pf_discountPrice").value) || 0,
    stock: Number(document.getElementById("pf_stock").value) || 0,
    rating: Number(document.getElementById("pf_rating").value) || 4.5,
    sizes: sizes.length ? sizes : ["Free Size"],
    colors: colors.length ? colors : ["Default"],
    description: document.getElementById("pf_description").value.trim(),
    image: mainImage,
    images: allImages,
    tag: "featured"
  };

  if (id) {
    const idx = products.findIndex(p => p.id === Number(id));
    if (idx > -1) products[idx] = { ...products[idx], ...data };
  } else {
    data.id = getNextProductId();
    products.push(data);
  }

  saveProducts(products);
  renderProductsTable();
  renderDashboardStats();
}

/* ==========================================================================
   ORDERS
   ========================================================================== */
const ORDER_STATUSES = ["Pending", "Confirmed", "Packed", "Shipped", "Delivered", "Cancelled"];

function renderOrdersTable() {
  const body = document.getElementById("ordersTableBody");
  if (!body) return;
  let orders = [...getOrders()].reverse();

  if (orderSearchTerm) {
    orders = orders.filter(o =>
      o.customer.name.toLowerCase().includes(orderSearchTerm) ||
      o.customer.mobile.toLowerCase().includes(orderSearchTerm) ||
      o.id.toLowerCase().includes(orderSearchTerm)
    );
  }

  body.innerHTML = orders.length ? orders.map(o => `
    <tr>
      <td><a href="#" onclick="openOrderModal('${o.id}'); return false;">${o.id}</a></td>
      <td>${o.customer.name}</td>
      <td>${o.customer.mobile}</td>
      <td>${o.customer.address}, ${o.customer.city}</td>
      <td>${o.items.reduce((s, i) => s + i.qty, 0)} item(s)</td>
      <td>${formatPrice(o.total)}</td>
      <td>${new Date(o.date).toLocaleDateString("en-IN")}</td>
      <td>
        <select onchange="changeOrderStatus('${o.id}', this.value)" class="status-pill status-${o.status}" style="border:none;">
          ${ORDER_STATUSES.map(s => `<option value="${s}" ${s === o.status ? "selected" : ""}>${s}</option>`).join("")}
        </select>
      </td>
      <td><button class="btn-admin danger small" onclick="deleteOrderUI('${o.id}')">Delete</button></td>
    </tr>
  `).join("") : `<tr><td colspan="9" style="color:#999;">No orders yet.</td></tr>`;
}

function changeOrderStatus(orderId, status) {
  updateOrderStatus(orderId, status);
  renderOrdersTable();
  renderDashboardStats();
}

function deleteOrderUI(orderId) {
  if (!confirm("Delete this order permanently?")) return;
  deleteOrder(orderId);
  renderOrdersTable();
  renderDashboardStats();
}

function initOrderModal() {
  const modal = document.getElementById("orderModal");
  const backdrop = document.getElementById("orderModalBackdrop");
  const closeBtn = document.getElementById("orderModalClose");
  const close = () => modal.classList.remove("is-open");
  backdrop.addEventListener("click", close);
  closeBtn.addEventListener("click", close);
}

function openOrderModal(orderId) {
  const order = getOrders().find(o => o.id === orderId);
  if (!order) return;
  const body = document.getElementById("orderModalBody");
  body.innerHTML = `
    <p><strong>Order ID:</strong> ${order.id}</p>
    <p><strong>Date:</strong> ${new Date(order.date).toLocaleString("en-IN")}</p>
    <p><strong>Customer:</strong> ${order.customer.name} (${order.customer.mobile})</p>
    <p><strong>Address:</strong> ${order.customer.address}, ${order.customer.city}, ${order.customer.state} - ${order.customer.pincode}</p>
    ${order.customer.notes ? `<p><strong>Notes:</strong> ${order.customer.notes}</p>` : ""}
    <div class="table-wrap" style="margin-top:14px;">
      <table><thead><tr><th>Item</th><th>Size</th><th>Color</th><th>Qty</th><th>Price</th></tr></thead>
      <tbody>
        ${order.items.map(i => `<tr><td>${i.name}</td><td>${i.size}</td><td>${i.color}</td><td>${i.qty}</td><td>${formatPrice(i.price * i.qty)}</td></tr>`).join("")}
      </tbody></table>
    </div>
    <p style="margin-top:14px;font-weight:700;font-size:16px;">Total: ${formatPrice(order.total)}</p>
  `;
  document.getElementById("orderModal").classList.add("is-open");
}
