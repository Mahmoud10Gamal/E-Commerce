document.body.style.paddingTop = document.querySelector('.gtml-navbar').offsetHeight + 'px';
const productsContainer = document.querySelector(".row.allproducts");
const badgeElement = document.querySelector("#alertMsg");
const navCartIcon = document.querySelector("nav .gtml-cart-icon");
const cartNumWrapper = document.querySelector(".gtml-cart-icon span");
const productsAnchor = document.querySelectorAll(".gtml-nav-menu li")[1];
const headerText = document.querySelector(".headertext");

let allProducts = JSON.parse(localStorage.getItem("AllProductsArr")) || [];
let iphoneProducts = [];
let oppoProducts = [];
let redmiProducts = [];

allProducts.forEach(product => {
  if (product.category === "iphone") {
    iphoneProducts.push(product);
  } else if (product.category === "oppo") {
    oppoProducts.push(product);
  } else if (product.category === "redmi") {
    redmiProducts.push(product);
  }
});



if (localStorage.getItem("ProductDetails")) {
  localStorage.removeItem("ProductDetails");
}

let myFragment = "";
let allProductsArray = JSON.parse(localStorage.getItem("AllProductsArr")) || [];
let categoryName = JSON.parse(localStorage.getItem("categoryName")) || "";
let loggedInUserID = JSON.parse(localStorage.getItem("userID"));
let allAccounts = JSON.parse(localStorage.getItem("Accounts")) || [];
console.log(loggedInUserID);

let loggedInUserObj = allAccounts.find(acc => acc.id === loggedInUserID) || { cart: [] };
let numOfCartItems = loggedInUserObj.cart.length; // عدد العناصر المختلفة

function displayAllProducts(arr) {
  myFragment = "";
  arr.forEach(product => {
    let stockBadge = product.stock > 0
      ? `<span class="badge text-bg-success">Available</span>`
      : `<span class="badge text-bg-danger">Out of Stock</span>`;

    myFragment += `
      <div class="col">
        <div class="card product h-100 overflow-hidden rounded-4" data-productID="${product.id}">
          <div class="image-wrapper h-100 position-relative">
            <img class="h-100 object-fit-cover" src="${product.image}" alt="">
            <div class="position-absolute icon-wrapper">
              <div class="cart-wrapper d-flex justify-content-center align-items-center">
                <i class="fa-solid fa-cart-shopping m-0"></i>
              </div>
            </div>
          </div>
          <div class="card-body p-3">
            <div class="d-flex justify-content-between align-items-center">
              <span class="product-name text-black mb-2 h4">${product.name}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="product-price mb-0">$ ${product.price}</h5>
              ${stockBadge}
            </div>
          </div>
        </div>
      </div>`;
  });
  productsContainer.innerHTML = myFragment.length > 0 ? myFragment : `<p class="h5 mt-3 ps-3">No products to display yet!</p>`;
}

if (categoryName.length > 0) {
  if (categoryName === "iphone") {
    headerText.querySelector("span").innerHTML = "iphone";
    displayAllProducts(iphoneProducts);
  } else if (categoryName === "oppo") {
    headerText.querySelector("span").innerHTML = "oppo";
    displayAllProducts(oppoProducts);
  } else if (categoryName === "redmi") {
    headerText.querySelector("span").innerHTML = "redmi";
    displayAllProducts(redmiProducts);
  }
} else {
  displayAllProducts(allProducts);
}

productsAnchor.addEventListener("click", function (e) {
  localStorage.removeItem("categoryName");
});

cartNumWrapper.innerHTML = numOfCartItems.toString();

function updateCardCartIcon(cartItemsArr) {
  let displayedProducts = Array.from(document.querySelectorAll(".col .card"));
  cartItemsArr.forEach(cartItem => {
    displayedProducts.forEach(product => {
      if (product.getAttribute("data-productID") === cartItem.id) {
        product.querySelector(".cart-wrapper i").style.color = "#0dcaf0";
      }
    });
  });
}

function handleBadge(message) {
  badgeElement.lastElementChild.innerHTML = message;
  badgeElement.style.top = "3%";
  setTimeout(() => {
    badgeElement.style.top = "-20%";
  }, 3000);
}

updateCardCartIcon(loggedInUserObj.cart);

productsContainer.addEventListener("click", function (e) {
  let targetProductID = e.target.closest("div.col")?.querySelector(".card").getAttribute("data-productID");
  if (!targetProductID) return;

  let targetProductObj = allProductsArray.find(p => p.id === targetProductID);

  if (
    e.target.parentElement.classList.contains("cart-wrapper") ||
    e.target.classList.contains("cart-wrapper") ||
    e.target.classList.contains("fa-cart-shopping")
  ) {
    e.stopPropagation();

    if (!loggedInUserID) {
      handleBadge("Please login first");
      return;
    }

    if (targetProductObj.stock <= 0) {
      handleBadge("This product is out of stock");
      return;
    }

    let existingItem = loggedInUserObj.cart.find(item => item.id === targetProductID);
    if (existingItem) {
      handleBadge("This product is already in your cart");
    } else {
      let newItem = { ...targetProductObj, quantity: 1 }; // إضافة quantity
      loggedInUserObj.cart.push(newItem);
      numOfCartItems++;
      cartNumWrapper.innerHTML = numOfCartItems.toString();
      handleBadge("Added to cart");
      localStorage.setItem("Accounts", JSON.stringify(allAccounts));
      updateCardCartIcon(loggedInUserObj.cart);
    }
  } else {
    localStorage.setItem("ProductDetails", JSON.stringify(targetProductObj));
    window.location.href = "/productDetails.html";
  }
});

navCartIcon.addEventListener("click", function () {
  window.location.href = "/cart.html";
});