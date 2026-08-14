/* ==========================================================================
   MANIYAR STORE — js/wishlist.js
   Wishlist data logic (localStorage). Loaded on every page after products.js.
   ========================================================================== */

function getWishlist() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.WISHLIST)) || []; }
  catch (e) { return []; }
}

function saveWishlist(list) {
  localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(list));
  updateWishlistBadge();
}

function isWishlisted(productId) {
  return getWishlist().includes(Number(productId));
}

function toggleWishlist(productId) {
  productId = Number(productId);
  let list = getWishlist();
  const already = list.includes(productId);
  list = already ? list.filter(id => id !== productId) : [...list, productId];
  saveWishlist(list);
  return !already;
}

function removeFromWishlist(productId) {
  saveWishlist(getWishlist().filter(id => id !== Number(productId)));
}

function updateWishlistBadge() {
  document.querySelectorAll(".js-wishlist-count").forEach(el => {
    const count = getWishlist().length;
    el.textContent = count;
    el.classList.toggle("is-hidden", count === 0);
  });
}

/* ---------------- WISHLIST PAGE (embedded as a drawer/section, see app.js) --- */
function renderWishlistPanel() {
  const wrap = document.getElementById("wishlist-items");
  if (!wrap) return;
  const ids = getWishlist();
  const products = ids.map(id => getProductById(id)).filter(Boolean);

  if (products.length === 0) {
    wrap.innerHTML = `<p class="empty-msg">Your wishlist is empty. Tap the ♡ icon on any product to save it here.</p>`;
    return;
  }

  wrap.innerHTML = products.map(p => `
    <div class="wishlist-item">
      <a href="product.html?id=${p.id}"><img src="${p.image}" alt="${p.name}" class="wishlist-item__img"></a>
      <div class="wishlist-item__info">
        <a href="product.html?id=${p.id}" class="wishlist-item__name">${p.name}</a>
        <p class="wishlist-item__price">${formatPrice(p.discountPrice || p.price)}</p>
        <div class="wishlist-item__actions">
          <button class="btn btn--primary btn--sm" onclick="moveWishlistItemToCart(${p.id})">Move to Cart</button>
          <button class="btn btn--outline btn--sm" onclick="removeWishlistItemUI(${p.id})">Remove</button>
        </div>
      </div>
    </div>
  `).join("");
}

function moveWishlistItemToCart(productId) {
  const p = getProductById(productId);
  if (!p) return;
  addToCart(productId, p.sizes[0], p.colors[0], 1);
  removeFromWishlist(productId);
  renderWishlistPanel();
  showToast("Moved to cart");
}

function removeWishlistItemUI(productId) {
  removeFromWishlist(productId);
  renderWishlistPanel();
  showToast("Removed from wishlist");
}

document.addEventListener("DOMContentLoaded", () => {
  updateWishlistBadge();
  renderWishlistPanel();
});
