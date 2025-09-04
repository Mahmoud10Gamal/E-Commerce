// Set active link based on current page/section
const logOutButton = document.getElementById('logout');
logOutButton.addEventListener('click', () => {
    window.location.href = "/index.html";
    localStorage.removeItem("userID")
    localStorage.removeItem("userRole")
})


function setActiveLink() {
    const links = document.querySelectorAll('.gtml-nav-menu li a');
    const currentHash = window.location.href.slice(21);
    console.log(currentHash);
    
    links.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentHash) {
            link.classList.add('active');
        }
    });
}

// Set active on page load
window.addEventListener('load', setActiveLink);

// Update active link on hash change
window.addEventListener('hashchange', setActiveLink);

// Update active link on scroll
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    const scrolled = window.pageYOffset;
    
    if (scrolled > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    const sections = document.querySelectorAll('.gtml-section');
    const links = document.querySelectorAll('.gtml-nav-menu li a');
    
    let currentSection = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        
        if (scrolled >= sectionTop && scrolled < sectionTop + sectionHeight) {
            currentSection = '#' + section.id;
        }
    });
    
    if (currentSection) {
        links.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentSection) {
                link.classList.add('active');
            }
        });
    }
});

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');

    if (window.innerWidth <= 768) {
        if (navMenu.classList.contains('active')) {
            navMenu.style.maxHeight = navMenu.scrollHeight + "px";
            navMenu.style.overflow = "hidden";
            navMenu.style.transition = "max-height 0.3s ease";
        } else {
            navMenu.style.maxHeight = null;
        }

        if (!navMenu.querySelector('.gtml-mobile-search')) {
            const mobileSearch = document.createElement('div');
            mobileSearch.className = 'gtml-mobile-search';
            mobileSearch.style.position = "relative"; 
            mobileSearch.innerHTML = '<input type="text" class="gtml-search-input gtml-mobile-search-input" placeholder="Search">';
            navMenu.insertBefore(mobileSearch, navMenu.firstChild);

            const mobileSearchInput = mobileSearch.querySelector('.gtml-search-input');
            initSearchFeature(mobileSearchInput, true);
        }
    } else {
        const existingMobileSearch = navMenu.querySelector('.gtml-mobile-search');
        if (existingMobileSearch) {
            existingMobileSearch.remove();
        }
        navMenu.style.maxHeight = null;
    }
});

// Clean up mobile search on window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        const existingMobileSearch = navMenu.querySelector('.gtml-mobile-search');
        if (existingMobileSearch) {
            existingMobileSearch.remove();
        }
        navMenu.classList.remove('active');
        navMenu.style.maxHeight = null;
    }
});

// Close menu on link click (mobile)
navMenu.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') {
        navMenu.classList.remove('active');
        navMenu.style.maxHeight = null;
    }
});

// ================== Search Suggestions Feature ==================
function initSearchFeature(inputElement, isMobile = false) {
    if (!inputElement) return;

    const products = JSON.parse(localStorage.getItem("AllProductsArr")) || [];

    let suggestionsBox = document.createElement("div");
    suggestionsBox.className = "gtml-suggestions-box";
    suggestionsBox.style.position = "absolute";
    suggestionsBox.style.top = "100%";
    suggestionsBox.style.left = "0";
    suggestionsBox.style.width = "100%";
    suggestionsBox.style.background = "#fff";
    suggestionsBox.style.border = "1px solid #ddd";
    suggestionsBox.style.borderRadius = "8px";
    suggestionsBox.style.zIndex = "2000";
    suggestionsBox.style.maxHeight = "250px";
    suggestionsBox.style.overflowY = "auto";
    suggestionsBox.style.display = "none";
    suggestionsBox.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";

    if (isMobile) {
        inputElement.parentElement.style.position = "relative";
    }

    inputElement.parentElement.appendChild(suggestionsBox);

    inputElement.addEventListener("input", () => {
        const query = inputElement.value.toLowerCase();
        suggestionsBox.innerHTML = "";

        if (query.length === 0) {
            suggestionsBox.style.display = "none";
            return;
        }

        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(query)
        ).slice(0, 8);

        if (filtered.length === 0) {
            let noResult = document.createElement("div");
            noResult.textContent = "No matching products found";
            noResult.style.padding = "15px";
            noResult.style.color = "#999";
            noResult.style.fontSize = "14px";
            noResult.style.textAlign = "center";
            noResult.style.fontStyle = "italic";
            suggestionsBox.appendChild(noResult);
            suggestionsBox.style.display = "block";
            return;
        }

        filtered.forEach(product => {
            let item = document.createElement("div");
            item.style.display = "flex";
            item.style.alignItems = "center";
            item.style.gap = "12px";
            item.style.padding = "10px";
            item.style.cursor = "pointer";
            item.style.transition = "background 0.2s";

            let img = document.createElement("img");
            img.src = product.image;
            img.alt = product.name;
            img.style.width = "40px";
            img.style.height = "40px";
            img.style.objectFit = "cover";
            img.style.borderRadius = "6px";
            img.style.border = "1px solid #eee";

            let name = document.createElement("span");
            name.textContent = product.name;
            name.style.fontSize = "14px";
            name.style.color = "#333";

            item.appendChild(img);
            item.appendChild(name);

            item.addEventListener("mouseover", () => {
                item.style.background = "#f7f7f7";
            });
            item.addEventListener("mouseout", () => {
                item.style.background = "#fff";
            });

            item.addEventListener("click", () => {
                localStorage.setItem("ProductDetails", JSON.stringify(product));
                window.location.href = "/productDetails.html";
            });

            suggestionsBox.appendChild(item);
        });

        suggestionsBox.style.display = "block";
    });

    document.addEventListener("click", (e) => {
        if (!inputElement.contains(e.target) && !suggestionsBox.contains(e.target)) {
            suggestionsBox.style.display = "none";
        }
    });
}

// Desktop search init
const desktopSearchInput = document.querySelector(".gtml-search-input");
if (desktopSearchInput) {
    initSearchFeature(desktopSearchInput);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});