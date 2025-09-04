// Set active link based on current page/section
const logOutButton = document.getElementById('logout');
logOutButton.addEventListener('click', () => {
    window.location.href = "/index.html";
    localStorage.removeItem("userID")
    localStorage.removeItem("userRole")
})
document.addEventListener("DOMContentLoaded", () => {
  // Get product data from localStorage
  const productData = JSON.parse(localStorage.getItem("ProductDetails"));
  const allProducts = JSON.parse(localStorage.getItem("AllProductsArr")) || [];
  const loggedInUserID = JSON.parse(localStorage.getItem("userID"));
  const allAccounts = JSON.parse(localStorage.getItem("Accounts")) || [];

  // Find the logged-in user's cart
  let loggedInUserObj = allAccounts.find(acc => acc.id === loggedInUserID) || { cart: [] };

  // If no product data, redirect to products page
  if (!productData) {
    window.location.href = "products.html";
    return;
  }

  // Find the product in AllProductsArr by ID
  const productInStock = allProducts.find(
    (product) => product.id === productData.id
  );

  // If product not found in AllProductsArr, redirect or handle error
  if (!productInStock) {
    window.location.href = "products.html";
    return;
  }

  // Page elements
  const productImage = document.getElementById("product-image");
  const productName = document.getElementById("product-name");
  const productDescription = document.getElementById("product-description");
  const productPrice = document.getElementById("product-price");
  const quantityInput = document.getElementById("quantity");
  const stockText = document.querySelector(".text-success"); // Targeting the stock status text
  const addToCartBtn = document.querySelector(".add-to-cart-btn");
  const cartCountElement = document.querySelector(".gtml-cart-count"); // Cart count element
  const cartIcon = document.querySelector(".gtml-cart-icon"); // Cart icon element
  const searchInput = document.querySelector(".gtml-search-input"); // Search input
  const searchResults = document.getElementById("search-results"); // Search results dropdown

  // Function to update cart count
  function updateCartCount() {
    // Use the user's cart from Accounts
    let cart = loggedInUserObj.cart || [];
    // Set cart count to the number of unique items
    cartCountElement.textContent = cart.length;
  }

  // Update cart count on page load
  updateCartCount();

  // Display product data
  productImage.src = productData.image;
  productName.textContent = productData.name;
  productDescription.textContent = productData.description;
  productPrice.textContent = `$${productData.price}`;

  // Check stock and update UI
  if (productInStock.stock > 0) {
    quantityInput.max = productInStock.stock; // Set max quantity to available stock
    stockText.textContent = `In Stock: ${productInStock.stock}`;
    stockText.classList.remove("text-danger"); // Ensure green color for in-stock
    stockText.classList.add("text-success");
    addToCartBtn.disabled = false; // Enable button
  } else {
    stockText.textContent = "Out of Stock";
    stockText.classList.remove("text-success"); // Change to red for out-of-stock
    stockText.classList.add("text-danger");
    quantityInput.disabled = true; // Disable quantity input
    addToCartBtn.disabled = true; // Disable button
  }

  // Add event listener to cart icon to redirect to cart.html
  cartIcon.addEventListener("click", () => {
    window.location.href = "cart.html";
  });

  // Search functionality
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    searchResults.innerHTML = ""; // Clear previous results
    searchResults.style.display = "none"; // Hide by default

    if (query) {
      // Filter products by name
      const filteredProducts = allProducts.filter((product) =>
        product.name.toLowerCase().includes(query)
      );

      if (filteredProducts.length > 0) {
        searchResults.style.display = "block"; // Show dropdown
        filteredProducts.forEach((product) => {
          const resultItem = document.createElement("div");
          resultItem.classList.add("search-result-item");
          resultItem.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <span>${product.name}</span>
          `;
          resultItem.addEventListener("click", () => {
            // Save selected product to ProductDetails
            localStorage.setItem(
              "ProductDetails",
              JSON.stringify({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                image: product.image,
              })
            );
            // Redirect to product details page
            window.location.href = "productDetails.html";
          });
          searchResults.appendChild(resultItem);
        });
      }
    }
  });

  // Hide search results when clicking outside
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.style.display = "none";
    }
  });

  // Add to cart function
  window.addToCart = function () {
    if (!loggedInUserID) {
      alert("Please login first");
      return;
    }

    let cart = loggedInUserObj.cart || [];
    let quantity = parseInt(quantityInput.value);

    // Validate quantity against stock
    if (quantity > productInStock.stock) {
      alert(`Only ${productInStock.stock} items available in stock`);
      return;
    }

    // Check if product already exists in cart
    let existingItem = cart.find((item) => item.id === productData.id);

    if (existingItem) {
      // If product exists, show alert and do nothing
      alert("Product is already in the cart!");
      return;
    }

    // Add new product to cart with all required fields
    cart.push({
      id: productData.id,
      name: productData.name,
      description: productData.description,
      price: productData.price,
      image: productData.image,
      category: productInStock.category,
      sellerId: productInStock.sellerId,
      stock: productInStock.stock,
      quantity: quantity,
    });

    // Update user's cart in Accounts
    let userIndex = allAccounts.findIndex(acc => acc.id === loggedInUserID);
    if (userIndex !== -1) {
      allAccounts[userIndex].cart = cart;
      localStorage.setItem("Accounts", JSON.stringify(allAccounts));
    }

    // Update cart count after adding to cart
    updateCartCount();
    alert("Product added to cart!");
  };

  // Toggle menu for mobile
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      menuToggle.classList.toggle("active");
    });
  }
});