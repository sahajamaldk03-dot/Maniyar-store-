/* ==========================================================================
   MANIYAR STORE — js/app.js
   Shared logic for index.html and shop.html: mobile menu, search bar,
   category rendering, product grids, and store-info injection (footer,
   contact section, WhatsApp / Instagram / Facebook links).
   Every function checks the element exists before touching it, so this one
   file safely runs on both pages (and does nothing on pages without these
   elements).
   ========================================================================== */

const CATEGORY_IMAGES = {
  "Men's Wear": "https://placehold.co/300x300/1a1a1a/ffffff?text=Men",
  "Women's Wear": "https://placehold.co/300x300/7a2f4a/ffffff?text=Women",
  "Kids Wear": "https://placehold.co/300x300/8a5a3f/ffffff?text=Kids",
  "T-Shirts": "https://placehold.co/300x300/333333/ffffff?text=T-Shirts",
  "Shirts": "https://placehold.co/300x300/4a4a2f/ffffff?text=Shirts",
  "Jeans": "https://placehold.co/300x300/2b3a55/ffffff?text=Jeans",
  "Waistcoats": "https://placehold.co/300x300/5c3d2e/ffffff?text=Waistcoats"
};

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initSearch();
  injectStoreInfo();
  renderCategoryScroll();
  renderHomeGrids();
  document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());
});

/* ---------------- MOBILE MENU ---------------- */
function initMobileMenu() {
  const menu = document.getElementById("mobileMenu");
  const openBtn = document.getElementById("menuToggle");
  const closeBtn = document.getElementById("mobileMenuClose");
  const backdrop = document.getElementById("mobileMenuBackdrop");
  if (!menu || !openBtn) return;
  const open = () => menu.classList.add("is-open");
  const close = () => menu.classList.remove("is-open");
  openBtn.addEventListener("click", open);
  closeBtn && closeBtn.addEventListener("click", close);
  backdrop && backdrop.addEventListener("click", close);
  menu.querySelectorAll("a").forEach(a => a.addEventListener("click", close));
}

/* ---------------- SEARCH ---------------- */
function initSearch() {
  const toggle = document.getElementById("searchToggle");
  const wrap = document.getElementById("searchBarWrap");
  const input = document.getElementById("searchInput");
  const suggestions = document.getElementById("searchSuggestions");

  if (toggle && wrap) {
    toggle.addEventListener("click", () => {
      wrap.classList.toggle("is-hidden");
      if (!wrap.classList.contains("is-hidden")) input && input.focus();
    });
  }

  if (!input || !suggestions) return;

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (q.length < 1) { suggestions.classList.add("is-hidden"); suggestions.innerHTML = ""; return; }
    const matches = getProducts().filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.gender || "").toLowerCase().includes(q) ||
      "maniyar store".includes(q)
    ).slice(0, 8);

    if (matches.length === 0) {
      suggestions.innerHTML = `<a href="#" style="color:#999;">No products found for "${input.value}"</a>`;
    } else {
      suggestions.innerHTML = matches.map(p => `
        <a href="product.html?id=${p.id}">
          <img src="${p.image}" alt="${p.name}">
          <span><strong style="display:block;font-size:13px;">${p.name}</strong><span style="font-size:11.5px;color:#888;">${p.category} • ${formatPrice(p.discountPrice || p.price)}</span></span>
        </a>`).join("");
    }
    suggestions.classList.remove("is-hidden");
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      window.location.href = "shop.html?q=" + encodeURIComponent(input.value.trim());
    }
  });

  document.addEventListener("click", (e) => {
    if (!suggestions.contains(e.target) && e.target !== input) suggestions.classList.add("is-hidden");
  });
}

/* ---------------- STORE INFO INJECTION ---------------- */
function injectStoreInfo() {
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setHref = (id, val) => { const el = document.getElementById(id); if (el) el.href = val; };

  setText("storeEmail", STORE_INFO.email);
  setText("storePhone", STORE_INFO.phoneDisplay);
  setText("footerPhone", STORE_INFO.phoneDisplay);
  setText("footerAddress", STORE_INFO.addressLine1 + ", " + STORE_INFO.addressLine2);

  setHref("getDirectionsBtn", STORE_INFO.mapsUrl);
  setHref("instaLink", STORE_INFO.instagram);
  setHref("fbLink", STORE_INFO.facebook);
  setHref("menuInstagram", STORE_INFO.instagram);
  setHref("menuWhatsapp", whatsappLink("Hi Maniyar Store, I'd like to know more about your products."));
  setHref("waLink", whatsappLink("Hi Maniyar Store, I'd like to know more about your products."));
  setHref("floatingWhatsapp", whatsappLink("Hi Maniyar Store, I'd like to place an order."));
}

/* ---------------- CATEGORY SCROLL ---------------- */
function renderCategoryScroll() {
  const wrap = document.getElementById("categoryScroll");
  if (!wrap) return;
  wrap.innerHTML = CATEGORIES.map(cat => `
    <a href="shop.html?category=${encodeURIComponent(cat)}" class="category-card">
      <img src="${CATEGORY_IMAGES[cat] || "https://placehold.co/300x300/cccccc/ffffff?text=" + encodeURIComponent(cat)}" alt="${cat}" class="category-card__img">
      <span>${cat}</span>
    </a>`).join("");
}

/* ---------------- HOMEPAGE GRIDS ---------------- */
function renderHomeGrids() {
  const featured = document.getElementById("featuredGrid");
  const newArr = document.getElementById("newArrivalsGrid");
  const best = document.getElementById("bestSellersGrid");
  if (!featured && !newArr && !best) return; // not on homepage

  const products = getProducts();
  if (featured) featured.innerHTML = products.filter(p => p.tag === "featured").slice(0, 8).map(productCardHTML).join("");
  if (newArr) newArr.innerHTML = products.filter(p => p.tag === "new").slice(0, 8).map(productCardHTML).join("");
  if (best) best.innerHTML = products.filter(p => p.tag === "bestseller").slice(0, 8).map(productCardHTML).join("");
}

/* ==========================================================================
   SHOP PAGE (shop.html) — search + category + price + size + color + stock
   filters, all combined. Reads ?q= / ?category= / ?filter= from the URL on
   first load so links from the homepage work correctly.
   ========================================================================== */
const shopState = { q: "", category: "All", tag: "All", size: "All", color: "All", availability: "All", maxPrice: null, sort: "default" };

function initShopPage() {
  const grid = document.getElementById("shopGrid");
  if (!grid) return; // not on shop.html

  const params = new URLSearchParams(window.location.search);
  if (params.get("q")) shopState.q = params.get("q");
  if (params.get("category")) shopState.category = params.get("category");
  if (params.get("filter")) shopState.tag = params.get("filter");

  const searchInput = document.getElementById("shopSearchInput");
  if (searchInput) {
    searchInput.value = shopState.q;
    searchInput.addEventListener("input", () => { shopState.q = searchInput.value.trim(); renderShopGrid(); });
  }

  renderFilterChips();
  renderFilterDrawerOptions();
  bindFilterDrawer();
  renderShopGrid();
}

function renderFilterChips() {
  const chipWrap = document.getElementById("categoryChips");
  if (!chipWrap) return;
  const cats = ["All", ...CATEGORIES];
  chipWrap.innerHTML = cats.map(cat => `
    <button class="filter-chip ${shopState.category === cat ? "is-active" : ""}" data-cat="${cat}">${cat}</button>
  `).join("");
  chipWrap.querySelectorAll(".filter-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      shopState.category = btn.dataset.cat;
      renderFilterChips();
      renderShopGrid();
    });
  });
}

function renderFilterDrawerOptions() {
  const sizeWrap = document.getElementById("filterSizes");
  const colorWrap = document.getElementById("filterColors");
  if (!sizeWrap || !colorWrap) return;
  const products = getProducts();
  const allSizes = [...new Set(products.flatMap(p => p.sizes))];
  const allColors = [...new Set(products.flatMap(p => p.colors))];

  sizeWrap.innerHTML = ["All", ...allSizes].map(s => `<button class="filter-option ${shopState.size === s ? "is-active" : ""}" data-size="${s}">${s}</button>`).join("");
  colorWrap.innerHTML = ["All", ...allColors].map(c => `<button class="filter-option ${shopState.color === c ? "is-active" : ""}" data-color="${c}">${c}</button>`).join("");

  sizeWrap.querySelectorAll(".filter-option").forEach(btn => btn.addEventListener("click", () => {
    shopState.size = btn.dataset.size;
    renderFilterDrawerOptions(); renderShopGrid();
  }));
  colorWrap.querySelectorAll(".filter-option").forEach(btn => btn.addEventListener("click", () => {
    shopState.color = btn.dataset.color;
    renderFilterDrawerOptions(); renderShopGrid();
  }));

  const availWrap = document.getElementById("filterAvailability");
  if (availWrap) {
    const opts = ["All", "In Stock", "Out of Stock"];
    availWrap.innerHTML = opts.map(o => `<button class="filter-option ${shopState.availability === o ? "is-active" : ""}" data-avail="${o}">${o}</button>`).join("");
    availWrap.querySelectorAll(".filter-option").forEach(btn => btn.addEventListener("click", () => {
      shopState.availability = btn.dataset.avail;
      renderFilterDrawerOptions(); renderShopGrid();
    }));
  }

  const priceSlider = document.getElementById("filterPrice");
  const priceLabel = document.getElementById("filterPriceLabel");
  if (priceSlider) {
    priceSlider.addEventListener("input", () => {
      shopState.maxPrice = Number(priceSlider.value);
      priceLabel.textContent = formatPrice(priceSlider.value);
      renderShopGrid();
    });
  }
}

function bindFilterDrawer() {
  const openBtn = document.getElementById("openFilterDrawer");
  const drawer = document.getElementById("filterDrawer");
  const closeBtn = document.getElementById("closeFilterDrawer");
  const backdrop = document.getElementById("filterDrawerBackdrop");
  const applyBtn = document.getElementById("applyFilterBtn");
  const sortSelect = document.getElementById("sortSelect");
  if (!drawer) return;
  const open = () => drawer.classList.add("is-open");
  const close = () => drawer.classList.remove("is-open");
  openBtn && openBtn.addEventListener("click", open);
  closeBtn && closeBtn.addEventListener("click", close);
  backdrop && backdrop.addEventListener("click", close);
  applyBtn && applyBtn.addEventListener("click", close);
  if (sortSelect) sortSelect.addEventListener("change", () => { shopState.sort = sortSelect.value; renderShopGrid(); });
}

function renderShopGrid() {
  const grid = document.getElementById("shopGrid");
  const countEl = document.getElementById("resultsCount");
  const emptyEl = document.getElementById("shopEmpty");
  if (!grid) return;

  let list = getProducts();

  if (shopState.q) {
    const q = shopState.q.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.gender || "").toLowerCase().includes(q));
  }
  if (shopState.category !== "All") {
    list = list.filter(p => p.category === shopState.category || (shopState.category.includes("Wear") && p.gender && shopState.category.startsWith(p.gender)));
  }
  if (shopState.tag !== "All") {
    list = list.filter(p => p.tag === shopState.tag);
  }
  if (shopState.size !== "All") {
    list = list.filter(p => p.sizes.includes(shopState.size));
  }
  if (shopState.color !== "All") {
    list = list.filter(p => p.colors.includes(shopState.color));
  }
  if (shopState.availability === "In Stock") list = list.filter(p => Number(p.stock) > 0);
  if (shopState.availability === "Out of Stock") list = list.filter(p => Number(p.stock) <= 0);
  if (shopState.maxPrice) list = list.filter(p => (p.discountPrice || p.price) <= shopState.maxPrice);

  if (shopState.sort === "price-asc") list = [...list].sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
  if (shopState.sort === "price-desc") list = [...list].sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
  if (shopState.sort === "rating") list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));

  if (countEl) countEl.textContent = `${list.length} product${list.length === 1 ? "" : "s"}`;

  if (list.length === 0) {
    grid.innerHTML = "";
    emptyEl && emptyEl.classList.remove("is-hidden");
  } else {
    emptyEl && emptyEl.classList.add("is-hidden");
    grid.innerHTML = list.map(productCardHTML).join("");
  }
}

document.addEventListener("DOMContentLoaded", initShopPage);
