const Role = JSON.parse(localStorage.getItem("userRole"));
if (window.location.pathname.includes("seller.html") && Role === "user") {
  alert("Access Denied! Only Admins allowed.");
  window.location.href = "Home.html";
}
const LS_PRODUCTS = 'AllProductsArr';
const LS_ORDERS = 'orders';

/* Utilities */
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);
const uid = () => 'p' + Math.floor(Math.random() * 1000);

/* Elements */
const navButtons = document.querySelectorAll('#mainNav .nav-link');
const sections = {
  overview: $('#overviewSection'),
  products: $('#productsSection'),
  orders: $('#ordersSection'),
  analytics: $('#analyticsSection')
};
const addProductBtn = $('#addProductBtn');
const productModalEl = document.getElementById('productModal');
const productModal = new bootstrap.Modal(productModalEl);
const productForm = $('#productForm');
const productImageFile = $('#productImageFile');
const productImageUrl = $('#productImageUrl');
const previewImg = $('#previewImg');

const orderModalEl = document.getElementById('orderModal');
const orderModal = new bootstrap.Modal(orderModalEl);
const orderForm = $('#orderForm');

let products = [];
let orders = [];

/* --- Init --- */
function loadFromStorage() {
  try {
    products = JSON.parse(localStorage.getItem(LS_PRODUCTS)) || [];
  } catch (e) { products = []; }
  try {
    orders = JSON.parse(localStorage.getItem(LS_ORDERS)) || [];
  } catch (e) { orders = []; }
}
function saveProducts() { localStorage.setItem(LS_PRODUCTS, JSON.stringify(products)); }
function saveOrders() { localStorage.setItem(LS_ORDERS, JSON.stringify(orders)); }

/* --- Navigation --- */
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const sec = btn.dataset.section;
    showSection(sec);
  });
});
function showSection(name) {
  Object.keys(sections).forEach(k => {
    sections[k].classList.toggle('d-none', k !== name);
  });
  refreshUI();
}

/* --- UI refresh functions --- */
function refreshUI() {
  // overview counts
  $('#productsCount').innerText = products.length;
  $('#ordersCount').innerText = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
  $('#totalRevenue').innerText = `EGP ${totalRevenue.toFixed(2)}`;
  $('#avgOrder').innerText = orders.length ? `EGP ${(totalRevenue / orders.length).toFixed(2)}` : 'EGP 0.00';
  $('#stockCount').innerText = products.reduce((s, p) => s + Number(p.stock || 0), 0);

  // recent orders
  const recent = orders.slice().reverse().slice(0, 5);
  $('#recentOrdersList').innerHTML = recent.length ? recent.map(o => `
    <div>
      <strong>${o.customerId || 'Anonymous Client'}</strong> - 
      ${o.products.reduce((s, p) => s + p.quantity, 0)} items - 
      EGP ${o.totalPrice.toFixed(2)} - 
      <small class="badge bg-warning">${o.status}</small>
    </div>`).join('') : 'There are no requests yet.';

  renderProducts();
  renderOrders();
  renderAnalytics();
}

function renderProducts() {
  const container = $('#productsGrid');
  container.innerHTML = '';
  if (products.length === 0) {
    container.innerHTML = `<div class="col-12"><div class="p-card text-muted">There are no products yet.</div></div>`;
    return;
  }

  products.forEach(p => {
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';
    col.innerHTML = `
      <div class="p-card d-flex gap-3 align-items-center">
        <img src="${p.image || ''}" class="img-thumb" onerror="this.style.display='none'">
        <div class="flex-fill">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="mb-1">${escapeHtml(p.name)}</h6>
              <small class="text-muted">${escapeHtml(p.description || '')}</small>
            </div>
            <div class="text-end">
              <div style="font-weight:700">EGP ${Number(p.price || 0).toFixed(2)}</div>
              <small class="text-muted">Stock: ${p.stock || 0}</small>
            </div>
          </div>

          <div class="mt-2 d-flex gap-2">
            <button class="btn btn-sm btn-outline-primary btn-edit" data-id="${p.id}"><i class="fa fa-pen"></i></button>
            <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${p.id}"><i class="fa fa-trash"></i></button>
            <button class="btn btn-sm btn-success ms-auto btn-order" data-id="${p.id}"><i class="fa fa-cart-plus"></i> Order</button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(col);
  });

  // attach events
  container.querySelectorAll('.btn-delete').forEach(b => {
    b.addEventListener('click', e => {
      const id = b.dataset.id;
      if (confirm('Do you want to delete the product?')) {
        products = products.filter(x => x.id !== id);
        saveProducts(); refreshUI();
      }
    });
  });
  container.querySelectorAll('.btn-edit').forEach(b => {
    b.addEventListener('click', () => openEditProduct(b.dataset.id));
  });
  container.querySelectorAll('.btn-order').forEach(b => {
    b.addEventListener('click', () => openOrderModal(b.dataset.id));
  });
}

function renderOrders() {
  const list = $('#ordersList');
  list.innerHTML = '';
  if (orders.length === 0) {
    list.innerHTML = `<div class="col-12"><div class="p-card text-muted">No requests.</div></div>`;
    return;
  }

  orders.slice().reverse().forEach(o => {
    const col = document.createElement('div');
    col.className = 'col-12';
    col.innerHTML = `
      <div class="p-card d-flex justify-content-between align-items-center">
        <div>
          <div><strong>${escapeHtml(o.customerId || 'client')}</strong> — ${o.date}</div>
          <div class="text-muted small">Items: ${o.products.map(pr => {
      const prod = products.find(p => p.id === pr.productId);
      return (prod ? prod.name : 'Unknown') + ' x' + pr.quantity;
    }).join(', ')}</div>
          <small class="badge bg-info">${o.paymentMethod || ''}</small>
          <small class="badge bg-warning">${o.status || ''}</small>
        </div>
        <div class="text-end">
          <div style="font-weight:700">EGP ${o.totalPrice.toFixed(2)}</div>
          <button class="btn btn-sm btn-outline-secondary btn-delete-order mt-2" data-id="${o.id}">delete</button>
        </div>
      </div>
    `;
    list.appendChild(col);
  });

  list.querySelectorAll('.btn-delete-order').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.dataset.id;
      if (confirm('Delete request?')) {
        orders = orders.filter(o => o.id !== id);
        saveOrders(); refreshUI();
      }
    });
  });
}


function renderAnalytics() {
  // Top Selling Products (stock)
  new Chart(document.getElementById('topProductsChart'), {
    type: 'bar',
    data: {
      labels: products.map(p => p.name),
      datasets: [{
        label: 'Stock',
        data: products.map(p => p.stock),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
      }]
    }
  });

  // Monthly Sales
  const monthlyLabels = orders.map(o => o.date);
  const monthlyTotals = orders.map(o => o.totalPrice);

  new Chart(document.getElementById('monthlySalesChart'), {
    type: 'line',
    data: {
      labels: monthlyLabels,
      datasets: [{
        label: 'Sales (EGP)',
        data: monthlyTotals,
        borderColor: 'green',
        backgroundColor: 'rgba(0,128,0,0.2)',
        fill: true,
        tension: 0.4
      }]
    }
  });
}

/* --- Product modal (add/edit) --- */
addProductBtn.addEventListener('click', () => {
  $('#productModalTitle').innerText = 'Add Product';
  productForm.reset();
  $('#productId').value = '';
  previewImg.style.display = 'none';
  productModal.show();
});

productImageFile.addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    previewImg.src = reader.result;
    previewImg.style.display = 'block';
  };
  reader.readAsDataURL(f);
});

productForm.addEventListener('submit', async (ev) => {
  ev.preventDefault();

  const id = $('#productId').value || uid();
  const name = $('#productName').value.trim();
  const price = Number($('#productPrice').value) || 0;
  const stock = Number($('#productQty').value) || 0;
  const description = $('#productDesc').value.trim();
  const category = $('#category').value;


  // resolve image
  let image = '';
  if (productImageFile.files && productImageFile.files[0]) {
    image = await fileToDataURL(productImageFile.files[0]);
  } else if (previewImg.src) {
    image = previewImg.src;
  }

  const productData = { id, name, price, stock, description, image, category, sellerId: "u2" };

  const existingIndex = products.findIndex(p => p.id === id);
  if (existingIndex >= 0) {
    products[existingIndex] = productData;
  } else {
    products.push(productData);
  }

  saveProducts();
  productModal.hide();
  productForm.reset();
  previewImg.style.display = 'none';
  refreshUI();
});

function openEditProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return alert('Product not found');
  $('#productModalTitle').innerText = 'Edit Product';
  $('#productId').value = p.id;
  $('#productName').value = p.name;
  $('#productPrice').value = p.price;
  $('#productQty').value = p.stock;
  $('#productDesc').value = p.description;
  $('#category').value = p.category || '';


  if (p.image) {
    previewImg.src = p.image;
    previewImg.style.display = 'block';
  } else {
    previewImg.style.display = 'none';
  }
  productModal.show();
}


/* --- Orders flow --- */
function openOrderModal(productId) {
  const p = products.find(x => x.id === productId);
  if (!p) return alert('Product not available');
  $('#orderProductId').value = p.id;
  $('#orderProductInfo').innerHTML = `<strong>${escapeHtml(p.name)}</strong><div class="text-muted">EGP ${Number(p.price).toFixed(2)} — Stock: ${p.stock}</div>`;
  $('#orderQty').value = 1;
  orderModal.show();
}

orderForm.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const pid = $('#orderProductId').value;
  const qty = Number($('#orderQty').value) || 1;
  const customer = $('#orderCustomer').value.trim();

  const p = products.find(x => x.id === pid);
  if (!p) return alert('Product not available');
  if (qty > Number(p.stock)) return alert('The quantity required is greater than the stock.');

  const orderObj = {
    id: uid(),
    customerId: customer || 'u1',
    products: [{ productId: p.id, quantity: qty }],
    totalPrice: Number((p.price * qty).toFixed(2)),
    shippingAddress: "Alexandria, Egypt",
    paymentMethod: "Cash on Delivery",
    status: "Pending",
    date: new Date().toISOString().split('T')[0]
  };
  orders.push(orderObj);

  p.stock = Number(p.stock) - qty;

  saveOrders();
  saveProducts();
  orderModal.hide();
  orderForm.reset();
  refreshUI();
});

/* --- Helpers --- */
function fileToDataURL(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}
function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, function (m) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]; });
}

/* On load */
loadFromStorage();
refreshUI();

/* Extra buttons */
$('#refreshProducts').addEventListener('click', () => renderProducts());
document.getElementById("logoutBtn").addEventListener("click", () => {
  window.location.href = "index.html";
});
/* Init show overview */
showSection('overview');
