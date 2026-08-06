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

        <img src="${product.image}" alt="${product.name}">

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
