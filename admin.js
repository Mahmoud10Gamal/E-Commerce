const Role = JSON.parse(localStorage.getItem("userRole"));
console.log(Role);
if (window.location.pathname.includes("admin.html") && Role === "user") {
    alert("Access Denied! Only Admins allowed.");
    window.location.href = "Home.html"; 
}
else if(window.location.pathname.includes("admin.html") && Role === "seller")
{
    alert("Access Denied! Only Admins allowed.");
    window.location.href = "seller.html"; 
}

// Helper function to convert file to Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

// 🔹 إضافة منتج جديد مع ID أوتوماتيك + Reset بعد الحفظ
document.getElementById('addProductForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const imageFile = document.getElementById('productImage').files[0];
    let imageBase64 = '';

    if (imageFile) {
        try {
            imageBase64 = await fileToBase64(imageFile);
        } catch (error) {
            alert('Error converting image to Base64');
            return;
        }
    }

    const product = {
        id: "p" + Math.floor(Math.random() * 1000), // 🔹 توليد ID تلقائي
        name: document.getElementById('productName').value,
        description: document.getElementById('description').value,
        price: parseFloat(document.getElementById('price').value),
        stock: parseInt(document.getElementById('stock').value),
        category: document.getElementById('category').value,
        sellerId: document.getElementById('sellerId').value,
        image: imageBase64
    };

    const AllProductsArr = JSON.parse(localStorage.getItem('AllProductsArr') || '[]');
    AllProductsArr.push(product);
    localStorage.setItem('AllProductsArr', JSON.stringify(AllProductsArr));

    bootstrap.Modal.getInstance(document.getElementById('addProductModal')).hide();
    loadProducts();

    // 🔹 مسح كل الحقول بعد الإضافة
    document.getElementById('addProductForm').reset();
    document.getElementById('productImage').value = '';
});

// 🔹 Edit Product - يملأ البيانات كاملة + الصورة
function editProduct(id) {
    const AllProductsArr = JSON.parse(localStorage.getItem('AllProductsArr') || '[]');
    const product = AllProductsArr.find(p => p.id === id);
    if (product) {
        document.getElementById('editProductId').value = product.id;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editDescription').value = product.description;
        document.getElementById('editPrice').value = product.price;
        document.getElementById('editStock').value = product.stock;
        document.getElementById('editCategory').value = product.category;
        document.getElementById('editSellerId').value = product.sellerId;

        // عرض الصورة الحالية
        const previewImg = document.getElementById('editImagePreview');
        if (previewImg) {
            previewImg.src = product.image || '';
        }

        const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
        modal.show();
    }
}

// Modified to handle Base64 image updates
document.getElementById('editProductForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const id = document.getElementById('editProductId').value;
    const imageFile = document.getElementById('editProductImage').files[0];
    let AllProductsArr = JSON.parse(localStorage.getItem('AllProductsArr') || '[]');

    // 🔹 مبدئيًا هات الصورة القديمة من المنتج
    let oldProduct = AllProductsArr.find(p => p.id === id);
    let imageBase64 = oldProduct ? oldProduct.image : '';

    // 🔹 لو المستخدم رفع صورة جديدة نعملها Base64
    if (imageFile) {
        try {
            imageBase64 = await fileToBase64(imageFile);
        } catch (error) {
            alert('Error converting image to Base64');
            return;
        }
    }

    AllProductsArr = AllProductsArr.map(p => {
        if (p.id === id) {
            return {
                ...p,
                name: document.getElementById('editProductName').value,
                description: document.getElementById('editDescription').value,
                price: parseFloat(document.getElementById('editPrice').value),
                stock: parseInt(document.getElementById('editStock').value),
                category: document.getElementById('editCategory').value,
                sellerId: document.getElementById('editSellerId').value,
                image: imageBase64 // 🔹 إما الصورة القديمة أو الجديدة
            };
        }
        return p;
    });

    localStorage.setItem('AllProductsArr', JSON.stringify(AllProductsArr));
    bootstrap.Modal.getInstance(document.getElementById('editProductModal')).hide();
    loadProducts();
});


// Display products with image column
function loadProducts() {
    const AllProductsArr = JSON.parse(localStorage.getItem('AllProductsArr') || '[]');
    const tbody = document.getElementById('productsTable');
    tbody.innerHTML = '';
    AllProductsArr.forEach(product => {
        const tr = document.createElement('tr');
        const imageSrc = product.image || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='; // Fallback transparent image
        tr.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.price}</td>
            <td>${product.stock}</td>
            <td>${product.category}</td>
            <td><img src="${imageSrc}" alt="${product.name}" style="width:50px;height:50px;"></td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editProduct('${product.id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Show section
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = section.id === sectionId ? 'block' : 'none';
    });
    document.querySelectorAll('.sidebar a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${sectionId}`);
    });
    if (sectionId === 'dashboard') loadDashboard();
    if (sectionId === 'users') loadUsers();
    if (sectionId === 'products') loadProducts();
    if (sectionId === 'orders') loadOrders();
}

// Load Dashboard
function loadDashboard() {
    const Accounts = JSON.parse(localStorage.getItem('Accounts') || '[]');
    const AllProductsArr = JSON.parse(localStorage.getItem('AllProductsArr') || '[]');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    document.getElementById('totalUsers').textContent = Accounts.length;
    document.getElementById('totalProducts').textContent = AllProductsArr.length;
    document.getElementById('totalOrders').textContent = orders.length;

    // Sales Chart
    const salesByDate = {};
    orders.forEach(o => {
        if (!salesByDate[o.date]) salesByDate[o.date] = 0;
        salesByDate[o.date] += o.totalPrice;
    });
    const dates = Object.keys(salesByDate).sort();
    const totals = dates.map(date => salesByDate[date]);

    const ctx = document.getElementById('salesChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Total Sales (EGP)',
                data: totals,
                backgroundColor: 'rgba(74, 144, 226, 0.2)',
                borderColor: 'rgba(74, 144, 226, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// Load Users
function loadUsers() {
    const Accounts = JSON.parse(localStorage.getItem('Accounts') || '[]');
    const tbody = document.getElementById('usersTable');
    tbody.innerHTML = '';
    Accounts.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="resetPassword('${user.id}')">Reset Password</button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Add User
document.getElementById('addUserForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const user = {
        id: "u" + Math.floor(Math.random() * 1000), // توليد id فريد
        name: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value,
        cart: []
    };

    const Accounts = JSON.parse(localStorage.getItem('Accounts') || '[]');
    Accounts.push(user);
    localStorage.setItem('Accounts', JSON.stringify(Accounts));

    bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
    loadUsers();
});

// Delete User
function deleteUser(id) {
    if (confirm('Are you sure that you want to delete this user?')) {
        let Accounts = JSON.parse(localStorage.getItem('Accounts') || '[]');
        Accounts = Accounts.filter(user => user.id !== id);
        localStorage.setItem('Accounts', JSON.stringify(Accounts));
        loadUsers();
    }
}

// Reset Password
function resetPassword(id) {
    if (confirm('Are you sure that you want to reset password for this user?')) {
        let Accounts = JSON.parse(localStorage.getItem('Accounts') || '[]');
        let userFound = false;

        Accounts = Accounts.map(user => {
            if (user.id === id) {
                user.password = 'reset123';
                userFound = true;
            }
            return user;
        });

        localStorage.setItem('Accounts', JSON.stringify(Accounts));

        if (userFound) {
            alert(`Password for user has been reset to 'reset123'`);
        } else {
            alert('User not found!');
        }

        loadUsers();
    }
}

// Delete Product
function deleteProduct(id) {
    if (confirm('Are you sure that you want to delete this product?')) {
        let AllProductsArr = JSON.parse(localStorage.getItem('AllProductsArr') || '[]');
        AllProductsArr = AllProductsArr.filter(product => product.id !== id);
        localStorage.setItem('AllProductsArr', JSON.stringify(AllProductsArr));
        loadProducts();
    }
}

// Orders 
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const tbody = document.getElementById('ordersTable');
    tbody.innerHTML = '';
    orders.forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${order.id}</td>
            <td>${order.customerId}</td>
            <td>${order.totalPrice}</td>
            <td>
                <select onchange="updateOrderStatus('${order.id}', this.value)">
                    <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                </select>
            </td>
            <td>${order.date}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteOrder('${order.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateOrderStatus(id, status) {
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders = orders.map(order => {
        if (order.id === id) {
            order.status = status;
        }
        return order;
    });
    localStorage.setItem('orders', JSON.stringify(orders));
    loadOrders();
}

function deleteOrder(id) {
    if (confirm('Are you sure that you want to delete this order?')) {
        let orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders = orders.filter(order => order.id !== id);
        localStorage.setItem('orders', JSON.stringify(orders));
        loadOrders();
    }
}

function logout() { 
    window.location.href = "index.html"; 
}

// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const toggleBtn = document.querySelector('.sidebar-toggle');
    const overlay = document.querySelector('.sidebar-overlay');
    sidebar.classList.toggle('active');
    document.body.classList.toggle('sidebar-open');
    if (sidebar.classList.contains('active')) {
        toggleBtn.style.display = 'none';
        overlay.style.display = 'block';
    } else {
        toggleBtn.style.display = 'block';
        overlay.style.display = 'none';
    }
}

document.querySelectorAll('.sidebar a').forEach(link => {
    link.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
            document.querySelector('.sidebar').classList.remove('active');
            document.body.classList.remove('sidebar-open');
            document.querySelector('.sidebar-toggle').style.display = 'block';
            document.querySelector('.sidebar-overlay').style.display = 'none';
        }
    });
});

document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('show.bs.modal', function () {
        document.querySelector('.sidebar-toggle').style.display = 'none';
    });
    modal.addEventListener('hidden.bs.modal', function () {
        if (!document.querySelector('.sidebar').classList.contains('active')) {
            document.querySelector('.sidebar-toggle').style.display = 'block';
        }
    });
});

// Initial Load
showSection('dashboard');
