let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

export function toggleWishlist(product) {

  const exist = wishlist.find(item => item.id === product.id);

  if (exist) {

    wishlist = wishlist.filter(item => item.id !== product.id);

  } else {

    wishlist.push(product);

  }

  localStorage.setItem(
    "wishlist",
    JSON.stringify(wishlist)
  );

  updateWishlistCount();

}

export function getWishlist() {

  return wishlist;

}

export function updateWishlistCount() {

  const count = document.getElementById("wishlist-count");

  if (!count) return;

  count.innerText = wishlist.length;

}

updateWishlistCount();
