const PRODUCTS_KEY = 'AllProductsArr';
const ACCOUNTS_KEY = 'Accounts';
const USER_ID_KEY = 'userID';
const ORDERS_KEY = 'orders';

function getProducts() {
  return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]');
}

function getUserCart() {
  const userId = JSON.parse(localStorage.getItem(USER_ID_KEY));
  if (!userId) return [];
  const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
  const user = accounts.find(acc => acc.id === userId);
  return user ? user.cart : [];
}

function updateUserCart(newCart) {
  const userId = JSON.parse(localStorage.getItem(USER_ID_KEY));
  if (!userId) return;
  let accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
  const userIndex = accounts.findIndex(acc => acc.id === userId);
  if (userIndex !== -1) {
    accounts[userIndex].cart = newCart;
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }
}

function renderCart() {
  const cart = getUserCart();
  const container = document.getElementById('cart-items');
  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
  }

  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'product-row';
    row.innerHTML = `
      <div class="product-img">
        <img src="${item.image}" alt="${item.name}" style="width:100px;height:100px;">
      </div>
      <div class="flex-grow-1">
        <div class="product-title">${item.name}</div>
        <div class="text-muted">EGP ${item.price.toFixed(2)}</div>
      </div>
      <div class="d-flex align-items-center">
        <button class="btn btn-sm btn-outline-secondary me-2" data-action="dec" data-id="${item.id}">-</button>
        <input class="form-control qty-input" type="number" min="1" max="${item.stock}" value="${item.quantity || 1}" data-id="${item.id}">
        <button class="btn btn-sm btn-outline-secondary ms-2" data-action="inc" data-id="${item.id}">+</button>
      </div>
      <div class="pe-3 fw-bold">EGP ${(item.price * (item.quantity || 1)).toFixed(2)}</div>
      <button class="remove-btn" title="Remove" data-remove="${item.id}">&times;</button>
    `;
    container.appendChild(row);
  });

  updateSummary();
  attachListeners();
}

function attachListeners() {
  document.querySelectorAll('[data-action="dec"]').forEach(btn => btn.onclick = () => changeQty(btn.dataset.id, -1));
  document.querySelectorAll('[data-action="inc"]').forEach(btn => btn.onclick = () => changeQty(btn.dataset.id, +1));
  document.querySelectorAll('.qty-input').forEach(inp => inp.onchange = () => setQty(inp.dataset.id, parseInt(inp.value) || 1));
  document.querySelectorAll('[data-remove]').forEach(btn => btn.onclick = () => removeFromCart(btn.dataset.remove));
}

function changeQty(productId, delta) {
  let cart = getUserCart();
  const idx = cart.findIndex(i => i.id === productId);
  if (idx === -1) return;

  let newQty = (cart[idx].quantity || 1) + delta;
  if (newQty < 1) newQty = 1;
  if (newQty > cart[idx].stock) newQty = cart[idx].stock;

  cart[idx].quantity = newQty;
  updateUserCart(cart);
  renderCart();
}

function setQty(productId, qty) {
  let cart = getUserCart();
  const idx = cart.findIndex(i => i.id === productId);
  if (idx === -1) return;

  if (qty < 1) qty = 1;
  if (qty > cart[idx].stock) qty = cart[idx].stock;

  cart[idx].quantity = qty;
  updateUserCart(cart);
  renderCart();
}

function removeFromCart(productId) {
  let cart = getUserCart();
  cart = cart.filter(i => i.id !== productId);
  updateUserCart(cart);
  renderCart();
}

function updateSummary() {
  const cart = getUserCart();
  const count = cart.length; // عدد العناصر المختلفة
  document.getElementById('summary-items').innerText = count;
  document.getElementById('items-count').innerText = count + ' items';

  let subtotal = cart.reduce((s, i) => {
    return s + (i.price * (i.quantity || 1));
  }, 0);

  const shipping = parseFloat(document.getElementById('shipping-select').value || 0);
  const total = subtotal + shipping;
  document.getElementById('total-price').innerText = 'EGP ' + total.toFixed(2);
}

document.getElementById('shipping-select').addEventListener('change', updateSummary);

document.getElementById('checkout-btn').addEventListener('click', () => {
  const cart = getUserCart();
  const userId = JSON.parse(localStorage.getItem(USER_ID_KEY));
  if (cart.length === 0) {
    alert('Cart is empty');
    return;
  }
  const paymentMethod = document.getElementById('payment-method').value;
  const order = {
    id: 'o' + Math.floor(Math.random() * 10000),
    customerId: userId,
    products: cart.map(i => ({ productId: i.id, quantity: i.quantity || 1 })),
    totalPrice: calculateTotalPrice(),
    status: 'Pending',
    shippingAddress: document.getElementById('shipping-address').value || 'Alexandria, Egypt',
    paymentMethod,
    date: new Date().toISOString().slice(0, 10)
  };

  const existingOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  existingOrders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(existingOrders));

  let products = getProducts();
  cart.forEach(item => {
    const idx = products.findIndex(p => p.id === item.id);
    if (idx !== -1) {
      products[idx].stock = Math.max(0, products[idx].stock - (item.quantity || 1));
    }
  });
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));

  updateUserCart([]);
  renderCart();

  if (paymentMethod === 'Card') {
    window.location.href = 'visa.html';
  } else {
    alert('Order placed successfully!\nOrder ID: ' + order.id);
  }
});

function calculateTotalPrice() {
  const cart = getUserCart();
  let subtotal = cart.reduce((s, i) => {
    return s + (i.price * (i.quantity || 1));
  }, 0);
  const shipping = parseFloat(document.getElementById('shipping-select').value || 0);
  return subtotal + shipping;
}

renderCart();