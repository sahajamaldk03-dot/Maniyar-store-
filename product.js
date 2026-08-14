/* ==========================================================================
   MANIYAR STORE — js/product.js
   Renders the product detail page based on ?id= in the URL.
   Only runs on product.html (checks for #pdpContent).
   ========================================================================== */

let currentProduct = null;
let selectedSize = null;
let selectedColor = null;
let selectedQty = 1;
let selectedImage = null;

document.addEventListener("DOMContentLoaded", () => {
  const wrap = document.getElementById("pdpContent");
  if (!wrap) return; // not on product.html

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  currentProduct = getProductById(id);

  if (!currentProduct) {
    wrap.innerHTML = `<div class="empty-msg" style="grid-column:1/-1;">
      <p>Sorry, we couldn't find that product.</p>
      <a href="shop.html" class="btn btn--primary" style="margin-top:14px;display:inline-flex;">Back to Shop</a>
    </div>`;
    return;
  }

  selectedSize = currentProduct.sizes[0];
  selectedColor = currentProduct.colors[0];
  selectedImage = currentProduct.images && currentProduct.images[0] ? currentProduct.images[0] : currentProduct.image;

  document.title = currentProduct.name + " | Maniyar Store";
  document.getElementById("crumbName").textContent = currentProduct.name;

  renderProduct();
  renderRelated();
  bindStickyBar();
});

function renderProduct() {
  const p = currentProduct;
  const wrap = document.getElementById("pdpContent");
  const pct = discountPercent(p);
  const inStock = Number(p.stock) > 0;
  const images = (p.images && p.images.length ? p.images : [p.image]);

  wrap.innerHTML = `
    <div class="pdp-gallery fade-in">
      <div class="pdp-gallery__main"><img id="mainImage" src="${selectedImage}" alt="${p.name}"></div>
      <div class="pdp-gallery__thumbs" id="thumbRow">
        ${images.map((img, i) => `<img src="${img}" class="${img === selectedImage ? "is-active" : ""}" data-img="${img}">`).join("")}
      </div>
    </div>
    <div class="pdp-info fade-in">
      <p class="pdp-category">${p.category}${p.gender ? " • " + p.gender : ""}</p>
      <h1 class="pdp-name">${p.name}</h1>
      <p class="pdp-rating">${starString(p.rating)} <span>(${p.rating || "New"} rating)</span></p>
      <div class="pdp-price">
        <span class="price-now">${formatPrice(p.discountPrice || p.price)}</span>
        ${p.discountPrice ? `<span class="price-old">${formatPrice(p.price)}</span>` : ""}
        ${pct > 0 ? `<span class="pdp-discount-pct">${pct}% OFF</span>` : ""}
      </div>
      <p class="pdp-stock ${inStock ? "in" : "out"}">${inStock ? `✔ In Stock (${p.stock} available)` : "✖ Out of Stock"}</p>

      <div class="option-group">
        <h4>Size</h4>
        <div class="option-swatches" id="sizeSwatches">
          ${p.sizes.map(s => `<button class="size-swatch ${s === selectedSize ? "is-active" : ""}" data-size="${s}">${s}</button>`).join("")}
        </div>
      </div>

      <div class="option-group">
        <h4>Color</h4>
        <div class="option-swatches" id="colorSwatches">
          ${p.colors.map(c => `<button class="color-swatch ${c === selectedColor ? "is-active" : ""}" data-color="${c}">${c}</button>`).join("")}
        </div>
      </div>

      <div class="option-group">
        <h4>Quantity</h4>
        <div class="qty-control">
          <button class="qty-btn" id="pdpQtyMinus">−</button>
          <input type="number" min="1" value="1" class="qty-input" id="pdpQtyInput">
          <button class="qty-btn" id="pdpQtyPlus">+</button>
        </div>
      </div>

      <div class="pdp-actions">
        <button class="btn btn--outline" id="addCartBtn" ${inStock ? "" : "disabled"}>Add to Cart</button>
        <button class="btn btn--primary" id="buyNowBtn" ${inStock ? "" : "disabled"}>Buy Now</button>
        <button class="btn btn--outline pdp-wishlist-btn" id="wishlistBtn">
          <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 21s-6.7-4.35-9.3-8.28C.86 9.94 1.4 6.2 4.6 4.6c2.2-1.1 4.6-.3 5.8 1.5.4.6.6.9.6.9s.2-.3.6-.9c1.2-1.8 3.6-2.6 5.8-1.5 3.2 1.6 3.74 5.34 1.9 8.12C18.7 16.65 12 21 12 21z" fill="${isWishlisted(p.id) ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.8"/></svg>
          <span id="wishlistBtnText">${isWishlisted(p.id) ? "Wishlisted" : "Wishlist"}</span>
        </button>
      </div>

      <div class="pdp-description">
        <h4>Product Description</h4>
        <p>${p.description}</p>
      </div>
    </div>
  `;

  bindProductInteractions();
}

function bindProductInteractions() {
  document.querySelectorAll("#thumbRow img").forEach(img => {
    img.addEventListener("click", () => {
      selectedImage = img.dataset.img;
      document.getElementById("mainImage").src = selectedImage;
      document.querySelectorAll("#thumbRow img").forEach(i => i.classList.toggle("is-active", i === img));
    });
  });

  document.querySelectorAll("#sizeSwatches .size-swatch").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedSize = btn.dataset.size;
      document.querySelectorAll("#sizeSwatches .size-swatch").forEach(b => b.classList.toggle("is-active", b === btn));
    });
  });

  document.querySelectorAll("#colorSwatches .color-swatch").forEach(btn => {
    btn.addEventListener("click", () => {
      selectedColor = btn.dataset.color;
      document.querySelectorAll("#colorSwatches .color-swatch").forEach(b => b.classList.toggle("is-active", b === btn));
    });
  });

  const qtyInput = document.getElementById("pdpQtyInput");
  document.getElementById("pdpQtyMinus").addEventListener("click", () => {
    selectedQty = Math.max(1, selectedQty - 1);
    qtyInput.value = selectedQty;
  });
  document.getElementById("pdpQtyPlus").addEventListener("click", () => {
    const max = Number(currentProduct.stock) || 99;
    selectedQty = Math.min(max, selectedQty + 1);
    qtyInput.value = selectedQty;
  });
  qtyInput.addEventListener("change", () => {
    selectedQty = Math.max(1, Number(qtyInput.value) || 1);
    qtyInput.value = selectedQty;
  });

  document.getElementById("addCartBtn").addEventListener("click", () => doAddToCart());
  document.getElementById("buyNowBtn").addEventListener("click", () => doBuyNow());
  document.getElementById("wishlistBtn").addEventListener("click", () => doToggleWishlist());
}

function doAddToCart() {
  addToCart(currentProduct.id, selectedSize, selectedColor, selectedQty);
  showToast(`${currentProduct.name} added to cart`);
}

function doBuyNow() {
  addToCart(currentProduct.id, selectedSize, selectedColor, selectedQty);
  window.location.href = "checkout.html";
}

function doToggleWishlist() {
  const nowWishlisted = toggleWishlist(currentProduct.id);
  const btn = document.getElementById("wishlistBtn");
  const text = document.getElementById("wishlistBtnText");
  if (btn) btn.querySelector("svg path").setAttribute("fill", nowWishlisted ? "currentColor" : "none");
  if (text) text.textContent = nowWishlisted ? "Wishlisted" : "Wishlist";
  showToast(nowWishlisted ? "Added to wishlist" : "Removed from wishlist");
}

function bindStickyBar() {
  const addBtn = document.getElementById("stickyAddCart");
  const buyBtn = document.getElementById("stickyBuyNow");
  if (addBtn) addBtn.addEventListener("click", doAddToCart);
  if (buyBtn) buyBtn.addEventListener("click", doBuyNow);
}

function renderRelated() {
  const wrap = document.getElementById("relatedGrid");
  if (!wrap) return;
  const related = getProducts().filter(p => p.category === currentProduct.category && p.id !== currentProduct.id).slice(0, 4);
  wrap.innerHTML = related.length
    ? related.map(productCardHTML).join("")
    : `<p style="color:#888;font-size:13.5px;">No related products yet.</p>`;
}
