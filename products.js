/* ==========================================================================
   MANIYAR STORE — js/products.js
   Product catalog + product-related helpers.
   Load this FIRST on every page, before app.js / product.js / cart.js /
   checkout.js / wishlist.js / admin.js.

   NOTE ON DATA: Right now all data (products, cart, wishlist, orders) is
   stored in the browser's localStorage — no server/database is needed to
   run the site. See js/firebase.js for how to replace this with a real
   Firebase Firestore database later.
   ========================================================================== */

/* ---------------- STORE INFO (edit these any time) ---------------- */
const STORE_INFO = {
  name: "Maniyar Store",
  addressLine1: "222, Maniyar Store, Bhendi Bazar",
  addressLine2: "Mumbai No. 3, Maharashtra, India",
  phoneDisplay: "+91 90000 00000",          // TODO: replace with your real number
  email: "hello@maniyarstore.example",       // TODO: replace with your real email
  instagram: "https://instagram.com/",       // TODO: paste your real Instagram URL
  facebook: "https://facebook.com/",         // TODO: paste your real Facebook URL
  // Google Maps search link built from the address (no invented coordinates)
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Maniyar Store, 222 Bhendi Bazar, Mumbai No. 3, Maharashtra, India")
};

/* TODO: replace with your real WhatsApp number.
   Format: country code + number, digits only, no + no spaces.
   Example below (91XXXXXXXXXX) is a PLACEHOLDER — orders will not reach you
   until you change it. */
const WHATSAPP_NUMBER = "91XXXXXXXXXX";

/* ---------------- DEFAULT PRODUCT CATALOG ---------------- */
/* This is the starting catalog. Once the site runs once in a browser, it is
   copied into localStorage, and from then on the admin dashboard edits the
   localStorage copy (this file is just the "factory default"). */
const DEFAULT_PRODUCTS = [
  { id: 1, name: "Classic Cotton Formal Shirt", category: "Shirts", gender: "Men",
    price: 1299, discountPrice: 899,
    image: "https://placehold.co/600x750/1a1a1a/ffffff?text=Maniyar+Store",
    images: ["https://placehold.co/600x750/1a1a1a/ffffff?text=Maniyar+Store",
             "https://placehold.co/600x750/2b2b2b/ffffff?text=Shirt+Back"],
    sizes: ["S","M","L","XL","XXL"], colors: ["White","Sky Blue","Black"],
    description: "A premium pure-cotton formal shirt with a tailored fit, perfect for office wear or festive occasions. Breathable fabric keeps you comfortable all day.",
    stock: 24, tag: "featured", rating: 4.6 },

  { id: 2, name: "Men's Slim Fit Jeans", category: "Jeans", gender: "Men",
    price: 1799, discountPrice: 1349,
    image: "https://placehold.co/600x750/2b3a55/ffffff?text=Slim+Fit+Jeans",
    images: ["https://placehold.co/600x750/2b3a55/ffffff?text=Slim+Fit+Jeans",
             "https://placehold.co/600x750/1f2a3d/ffffff?text=Jeans+Back"],
    sizes: ["28","30","32","34","36"], colors: ["Dark Blue","Black","Light Wash"],
    description: "Stretchable slim-fit denim jeans built for everyday comfort and a sharp, modern silhouette.",
    stock: 18, tag: "bestseller", rating: 4.7 },

  { id: 3, name: "Premium Waistcoat Set", category: "Waistcoats", gender: "Men",
    price: 2499, discountPrice: 1899,
    image: "https://placehold.co/600x750/5c3d2e/ffffff?text=Waistcoat",
    images: ["https://placehold.co/600x750/5c3d2e/ffffff?text=Waistcoat",
             "https://placehold.co/600x750/402a20/ffffff?text=Waistcoat+Back"],
    sizes: ["M","L","XL"], colors: ["Maroon","Navy","Black"],
    description: "Elegant festive waistcoat crafted for weddings and celebrations. Pairs perfectly with a kurta or shirt.",
    stock: 10, tag: "new", rating: 4.8 },

  { id: 4, name: "Graphic Print T-Shirt", category: "T-Shirts", gender: "Men",
    price: 799, discountPrice: 549,
    image: "https://placehold.co/600x750/222222/ffffff?text=Graphic+Tee",
    images: ["https://placehold.co/600x750/222222/ffffff?text=Graphic+Tee",
             "https://placehold.co/600x750/111111/ffffff?text=Tee+Back"],
    sizes: ["S","M","L","XL"], colors: ["Black","White","Grey"],
    description: "Soft, breathable cotton t-shirt with a trendy graphic print. A wardrobe essential for daily wear.",
    stock: 40, tag: "bestseller", rating: 4.5 },

  { id: 5, name: "Kids Casual Shirt", category: "Kids Wear", gender: "Kids",
    price: 699, discountPrice: 499,
    image: "https://placehold.co/600x750/8a5a3f/ffffff?text=Kids+Shirt",
    images: ["https://placehold.co/600x750/8a5a3f/ffffff?text=Kids+Shirt",
             "https://placehold.co/600x750/6b4530/ffffff?text=Kids+Shirt+Back"],
    sizes: ["2-3Y","4-5Y","6-7Y","8-9Y"], colors: ["Red Check","Blue Check","Green"],
    description: "Soft cotton casual shirt for kids, designed for all-day comfort and easy movement.",
    stock: 30, tag: "new", rating: 4.4 },

  { id: 6, name: "Kids Denim Jeans", category: "Kids Wear", gender: "Kids",
    price: 899, discountPrice: 649,
    image: "https://placehold.co/600x750/3a4d6b/ffffff?text=Kids+Jeans",
    images: ["https://placehold.co/600x750/3a4d6b/ffffff?text=Kids+Jeans",
             "https://placehold.co/600x750/2a3850/ffffff?text=Kids+Jeans+Back"],
    sizes: ["2-3Y","4-5Y","6-7Y","8-9Y"], colors: ["Blue","Black"],
    description: "Durable, stretchable denim jeans for kids, built to survive playtime while still looking sharp.",
    stock: 22, tag: "featured", rating: 4.5 },

  { id: 7, name: "Checked Casual Shirt", category: "Shirts", gender: "Men",
    price: 1199, discountPrice: 849,
    image: "https://placehold.co/600x750/4a4a2f/ffffff?text=Checked+Shirt",
    images: ["https://placehold.co/600x750/4a4a2f/ffffff?text=Checked+Shirt",
             "https://placehold.co/600x750/34341f/ffffff?text=Shirt+Back"],
    sizes: ["S","M","L","XL","XXL"], colors: ["Olive Check","Brown Check"],
    description: "Relaxed-fit checked shirt made from a soft cotton blend fabric — great for weekend outings.",
    stock: 16, tag: "featured", rating: 4.3 },

  { id: 8, name: "Plain Round Neck T-Shirt", category: "T-Shirts", gender: "Men",
    price: 599, discountPrice: 399,
    image: "https://placehold.co/600x750/333333/ffffff?text=Round+Neck+Tee",
    images: ["https://placehold.co/600x750/333333/ffffff?text=Round+Neck+Tee",
             "https://placehold.co/600x750/1c1c1c/ffffff?text=Tee+Back"],
    sizes: ["S","M","L","XL","XXL"], colors: ["White","Black","Maroon","Navy"],
    description: "Everyday essential round-neck t-shirt in soft combed cotton. Available in multiple colors.",
    stock: 55, tag: "bestseller", rating: 4.6 },

  { id: 9, name: "Straight Fit Jeans", category: "Jeans", gender: "Men",
    price: 1699, discountPrice: 1249,
    image: "https://placehold.co/600x750/24344a/ffffff?text=Straight+Fit+Jeans",
    images: ["https://placehold.co/600x750/24344a/ffffff?text=Straight+Fit+Jeans",
             "https://placehold.co/600x750/182535/ffffff?text=Jeans+Back"],
    sizes: ["30","32","34","36","38"], colors: ["Blue","Black"],
    description: "Classic straight-fit jeans with a timeless look, built for comfort and durability.",
    stock: 20, tag: "new", rating: 4.4 },

  { id: 10, name: "Festive Embroidered Waistcoat", category: "Waistcoats", gender: "Men",
    price: 2999, discountPrice: 2299,
    image: "https://placehold.co/600x750/6b1f2a/ffffff?text=Festive+Waistcoat",
    images: ["https://placehold.co/600x750/6b1f2a/ffffff?text=Festive+Waistcoat",
             "https://placehold.co/600x750/4a141c/ffffff?text=Waistcoat+Back"],
    sizes: ["M","L","XL","XXL"], colors: ["Maroon Gold","Black Gold"],
    description: "Richly embroidered waistcoat designed for weddings and special occasions. Premium finish.",
    stock: 8, tag: "featured", rating: 4.9 },

  { id: 11, name: "Women's Anarkali Kurti", category: "Women's Wear", gender: "Women",
    price: 1899, discountPrice: 1399,
    image: "https://placehold.co/600x750/7a2f4a/ffffff?text=Anarkali+Kurti",
    images: ["https://placehold.co/600x750/7a2f4a/ffffff?text=Anarkali+Kurti",
             "https://placehold.co/600x750/5c2138/ffffff?text=Kurti+Back"],
    sizes: ["S","M","L","XL"], colors: ["Wine","Teal","Mustard"],
    description: "Flowing Anarkali-style kurti in soft, breathable fabric with elegant detailing — perfect for daily wear or light festive occasions.",
    stock: 15, tag: "new", rating: 4.7 },

  { id: 12, name: "Women's Straight Fit Palazzo Set", category: "Women's Wear", gender: "Women",
    price: 1599, discountPrice: 1199,
    image: "https://placehold.co/600x750/2f4a3d/ffffff?text=Palazzo+Set",
    images: ["https://placehold.co/600x750/2f4a3d/ffffff?text=Palazzo+Set",
             "https://placehold.co/600x750/1f3329/ffffff?text=Palazzo+Back"],
    sizes: ["S","M","L","XL"], colors: ["Forest Green","Beige","Black"],
    description: "Comfortable co-ord palazzo set made for effortless everyday style.",
    stock: 12, tag: "bestseller", rating: 4.5 },

  { id: 13, name: "Kids Party Wear T-Shirt", category: "Kids Wear", gender: "Kids",
    price: 549, discountPrice: 399,
    image: "https://placehold.co/600x750/7a5c9e/ffffff?text=Kids+Party+Tee",
    images: ["https://placehold.co/600x750/7a5c9e/ffffff?text=Kids+Party+Tee",
             "https://placehold.co/600x750/5b4278/ffffff?text=Kids+Tee+Back"],
    sizes: ["2-3Y","4-5Y","6-7Y","8-9Y"], colors: ["Purple","Blue"],
    description: "Fun and comfortable party-wear t-shirt for kids with a soft printed design.",
    stock: 25, tag: "new", rating: 4.7 },

  { id: 14, name: "Full Sleeve Formal Shirt", category: "Shirts", gender: "Men",
    price: 1399, discountPrice: 999,
    image: "https://placehold.co/600x750/1f1f1f/ffffff?text=Formal+Shirt",
    images: ["https://placehold.co/600x750/1f1f1f/ffffff?text=Formal+Shirt",
             "https://placehold.co/600x750/141414/ffffff?text=Shirt+Back"],
    sizes: ["S","M","L","XL","XXL"], colors: ["White","Black","Grey"],
    description: "Crisp full-sleeve formal shirt tailored for a sharp office look.",
    stock: 12, tag: "bestseller", rating: 4.5 },

  { id: 15, name: "Women's Denim Jacket", category: "Women's Wear", gender: "Women",
    price: 2199, discountPrice: 1699,
    image: "https://placehold.co/600x750/3d5470/ffffff?text=Denim+Jacket",
    images: ["https://placehold.co/600x750/3d5470/ffffff?text=Denim+Jacket",
             "https://placehold.co/600x750/2a3c52/ffffff?text=Jacket+Back"],
    sizes: ["S","M","L","XL"], colors: ["Light Blue","Dark Blue"],
    description: "Trendy cropped denim jacket to layer over any outfit for an effortlessly stylish look.",
    stock: 9, tag: "featured", rating: 4.6 }
];

const CATEGORIES = ["Men's Wear", "Women's Wear", "Kids Wear", "T-Shirts", "Shirts", "Jeans", "Waistcoats"];

/* ---------------- STORAGE KEYS ---------------- */
const STORAGE_KEYS = {
  PRODUCTS: "maniyar_products",
  CART: "maniyar_cart",
  WISHLIST: "maniyar_wishlist",
  ORDERS: "maniyar_orders",
  ADMIN_AUTH: "maniyar_admin_auth"
};

/* ---------------- PRODUCT HELPERS ---------------- */
function getProducts() {
  let stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    return JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS));
    return JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
  }
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
}

function getProductById(id) {
  return getProducts().find(p => String(p.id) === String(id));
}

function getNextProductId() {
  const products = getProducts();
  return products.length ? Math.max(...products.map(p => Number(p.id))) + 1 : 1;
}

/* ---------------- FORMAT HELPERS ---------------- */
function formatPrice(num) {
  return "₹" + Number(num).toLocaleString("en-IN");
}

function discountPercent(product) {
  if (!product.discountPrice || product.discountPrice >= product.price) return 0;
  return Math.round(((product.price - product.discountPrice) / product.price) * 100);
}

function starString(rating) {
  const full = Math.round(rating || 0);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function whatsappLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/* ---------------- SHARED PRODUCT CARD RENDERER ---------------- */
/* Used by index.html and shop.html so cards look identical everywhere. */
function productCardHTML(p) {
  const pct = discountPercent(p);
  const outOfStock = Number(p.stock) <= 0;
  const wished = isWishlisted(p.id);
  return `
  <article class="product-card" data-id="${p.id}">
    <a href="product.html?id=${p.id}" class="product-card__img-wrap">
      <img src="${p.image}" alt="${p.name}" loading="lazy" class="product-card__img">
      ${pct > 0 ? `<span class="badge badge--sale">${pct}% OFF</span>` : ""}
      ${outOfStock ? `<span class="badge badge--out">Out of Stock</span>` : ""}
      <button class="wishlist-btn ${wished ? "is-active" : ""}" data-id="${p.id}" aria-label="Add to wishlist" onclick="event.preventDefault(); handleWishlistClick(${p.id}, this)">
        <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 21s-6.7-4.35-9.3-8.28C.86 9.94 1.4 6.2 4.6 4.6c2.2-1.1 4.6-.3 5.8 1.5.4.6.6.9.6.9s.2-.3.6-.9c1.2-1.8 3.6-2.6 5.8-1.5 3.2 1.6 3.74 5.34 1.9 8.12C18.7 16.65 12 21 12 21z" fill="${wished ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.8"/></svg>
      </button>
    </a>
    <div class="product-card__body">
      <p class="product-card__category">${p.category}</p>
      <a href="product.html?id=${p.id}" class="product-card__name">${p.name}</a>
      <div class="product-card__rating">${starString(p.rating)} <span>(${p.rating || "New"})</span></div>
      <div class="product-card__price">
        <span class="price-now">${formatPrice(p.discountPrice || p.price)}</span>
        ${p.discountPrice ? `<span class="price-old">${formatPrice(p.price)}</span>` : ""}
      </div>
      <div class="product-card__actions">
        <button class="btn btn--outline btn--sm" ${outOfStock ? "disabled" : ""} onclick="handleQuickAdd(${p.id}, this)">Add to Cart</button>
        <a href="product.html?id=${p.id}" class="btn btn--primary btn--sm">View</a>
      </div>
    </div>
  </article>`;
}

/* Quick-add from a product card: uses first available size/color */
function handleQuickAdd(productId, btnEl) {
  const p = getProductById(productId);
  if (!p || Number(p.stock) <= 0) return;
  addToCart(productId, p.sizes[0], p.colors[0], 1);
  if (btnEl) {
    const original = btnEl.textContent;
    btnEl.textContent = "Added ✓";
    btnEl.disabled = true;
    setTimeout(() => { btnEl.textContent = original; btnEl.disabled = false; }, 1200);
  }
  showToast(`${p.name} added to cart`);
}

function handleWishlistClick(productId, btnEl) {
  const nowWishlisted = toggleWishlist(productId);
  if (btnEl) btnEl.classList.toggle("is-active", nowWishlisted);
  showToast(nowWishlisted ? "Added to wishlist" : "Removed from wishlist");
}

/* ---------------- TOAST (small popup confirmation) ---------------- */
function showToast(message) {
  let toast = document.getElementById("ms-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "ms-toast";
    toast.className = "ms-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("is-visible"), 1800);
}
