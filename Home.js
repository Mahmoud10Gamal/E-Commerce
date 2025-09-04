document.body.style.paddingTop = document.querySelector('.gtml-navbar').offsetHeight + 'px';

// ?----------------------------

const categoriesContainer = document.querySelector(".categories");
const carouselSection = document.querySelector("section#carousel");
const cartIcon = document.querySelector(".gtml-cart-icon");
const cartCountElement = document.querySelector(".gtml-cart-count");
let loggedInUserID = JSON.parse(localStorage.getItem("userID")) || null
let allAcounts = JSON.parse(localStorage.getItem("Accounts"))




// ?=-=-----------------------

// ? remove category Name from localStorage
console.log("from home");

  localStorage.removeItem("categoryName")
// ?---------------------------------------------------

 
let loggedInUserObj;
 for (let i = 0; i < allAcounts.length; i++) {
    if (allAcounts[i].id === loggedInUserID) {
      loggedInUserObj = allAcounts[i]
      
    }
  
 }
cartIcon.querySelector(".gtml-cart-count").innerHTML = loggedInUserObj.cart.length

cartIcon.addEventListener("click", () => {
  window.location.href = "/cart.html";
});



categoriesContainer.addEventListener("click", function(e) {
  if (e.target.closest("div.iphone")) {
    localStorage.setItem("categoryName",JSON.stringify("iphone"));
    console.log(e.target.closest("div.iphone"));
    
    window.location.href = "/products.html";
  } else if (e.target.closest("div.oppo")) {
    console.log(e.target.closest("div.oppo"));
     localStorage.setItem("categoryName",JSON.stringify("oppo"));
   
    window.location.href = "/products.html";
  } else if (e.target.closest("div.redmi")) {
   localStorage.setItem("categoryName",JSON.stringify("redmi"));
   console.log(e.target.closest("div.redmi"));
   
    window.location.href = "/products.html";
  } else {
    e.stopPropagation();
  }
});

carouselSection.addEventListener("click", function(e) {
  if (e.target.tagName === "IMG") {
    window.location.href = "/products.html";
  }
});


















// تحديث عدد العناصر في الكارت
// function updateCartCount() {
//   let cartProducts = JSON.parse(localStorage.getItem("cartProducts")) || [];
//   cartCountElement.textContent = cartProducts.length;
// }

// console.log(cartCountElement);
// console.log(cartIcon.querySelector(".gtml-cart-count").innerHTML =cartProducts.length);