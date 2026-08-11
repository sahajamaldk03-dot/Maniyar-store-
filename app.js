import { db } from "./firebase.js";

import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
  buyProduct
} from "./js/order.js";

import {
  toggleWishlist,
  updateWishlistCount
} from "./js/wishlist.js";

import {
  addToCart,
  updateCartCount
} from "./js/cart.js";

const productContainer = document.getElementById("product-container");
const searchInput = document.getElementById("search-input");

let products = [];

// ==========================
// LOAD PRODUCTS
// ==========================

async function loadProducts() {

  try {

    const snapshot = await getDocs(
      collection(db, "products")
    );

    products = [];

    snapshot.forEach((doc) => {

      products.push({

        id: doc.id,

        ...doc.data()

      });

    });console.log(products);
alert("Products: " + products.length);

    displayProducts(products);

  } catch (error) {

  console.error(error);

  alert("Firebase Error:\n" + error.message);

  productContainer.innerHTML = `
    <h2 style="text-align:center;color:red">
      Products Load Failed 😢
    </h2>

    <p style="text-align:center;color:red">
      ${error.message}
    </p>
  `;

  }


}// ==========================
// DISPLAY PRODUCTS
// ==========================

function displayProducts(data) {

  productContainer.innerHTML = "";

  if (data.length === 0) {

    productContainer.innerHTML = `
      <h2 style="text-align:center">
      No Products Found 😔
      </h2>
    `;

    return;
  }

  data.forEach((product) => {

    productContainer.innerHTML += `

      <div class="product-card">

       <img src="${product.image || 'https://via.placeholder.com/300x300?text=No+Image'}" alt="${product.name}">

        <div class="product-info">

          <h3>${product.name}</h3>

          <p>${product.category}</p>

          <span class="price">
            ₹${product.price}
          </span>

          <span class="old-price">
            ₹${product.brandPrice || ""}
          </span>

          <div class="product-buttons">

            <button
              class="cart-btn"
              data-id="${product.id}">
              🛒 Cart
            </button>

            <button
              class="wish-btn"
              data-id="${product.id}">
              ❤️
            </button>

            <button
              class="buy-btn"
              data-id="${product.id}">
              Buy Now
            </button>

          </div>

        </div>

      </div>

    `;

  });

}// ==========================
// SEARCH PRODUCTS
// ==========================

searchInput.addEventListener("input", () => {

  let text = searchInput.value.toLowerCase();

  let result = products.filter(product =>

    product.name.toLowerCase().includes(text) ||

    product.category.toLowerCase().includes(text)

  );

  displayProducts(result);

});

// ==========================
// CATEGORY FILTER
// ==========================

document
  .querySelectorAll(".category button")
  .forEach(button => {

    button.onclick = () => {

      let category = button.dataset.category;

      if (category === "all") {

        displayProducts(products);

      } else {

        let result = products.filter(product =>

          product.category
            .toLowerCase()
            .includes(category)

        );

        displayProducts(result);

      }

    };

  });// ==========================
// BUTTON ACTIONS
// ==========================

document.addEventListener("click", (e) => {

  // BUY NOW
  if (e.target.classList.contains("buy-btn")) {

    const id = e.target.dataset.id;

    const product = products.find(p => p.id === id);

    if (product) {
      buyProduct(product);
    }

  }

  // WISHLIST
  if (e.target.classList.contains("wish-btn")) {

    const id = e.target.dataset.id;

    const product = products.find(p => p.id === id);

    if (product) {

      toggleWishlist(product);

      alert("❤️ Wishlist Updated");

    }

  }

  // ADD TO CART
  if (e.target.classList.contains("cart-btn")) {

    const id = e.target.dataset.id;

    const product = products.find(p => p.id === id);

    if (product) {

      addToCart(product);

      updateCartCount();

      alert("🛒 Added To Cart");

    }

  }

});

// ==========================
// START APP
// ==========================

updateCartCount();
updateWishlistCount();
loadProducts();
// ================= MENU =================

function openMenu() {
  document.getElementById("sideMenu").classList.add("active");
  document.getElementById("menuOverlay").classList.add("active");
}

function closeMenu() {
  document.getElementById("sideMenu").classList.remove("active");
  document.getElementById("menuOverlay").classList.remove("active");
}

function toggleSubmenu(id) {
  const submenu = document.getElementById(id);
  submenu.classList.toggle("active");
}
// ================= MENU =================

const menuBtn = document.getElementById("menuBtn");
const closeMenuBtn = document.getElementById("closeMenuBtn");
const sideMenu = document.getElementById("sideMenu");
const menuOverlay = document.getElementById("menuOverlay");

// OPEN MENU
menuBtn.addEventListener("click", () => {

  sideMenu.classList.add("active");
  menuOverlay.classList.add("active");

});

// CLOSE MENU
closeMenuBtn.addEventListener("click", () => {

  sideMenu.classList.remove("active");
  menuOverlay.classList.remove("active");

});

// CLOSE BY OVERLAY
menuOverlay.addEventListener("click", () => {

  sideMenu.classList.remove("active");
  menuOverlay.classList.remove("active");

});

// SUBMENU
document.querySelectorAll(".submenu-btn").forEach(button => {

  button.addEventListener("click", () => {

    const menuId = button.dataset.menu;
    const submenu = document.getElementById(menuId);

    submenu.classList.toggle("active");

  });

});
