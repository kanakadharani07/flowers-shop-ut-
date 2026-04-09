// Product Data
const products = [
    {
        id: 1,
        name: "Midnight Rose Bouquet",
        price: 85.00,
        image: "assets/rose.png",
        description: "A sophisticated arrangement of deep red roses, hand-selected for their velvety texture and timeless beauty. Perfect for expressing deep affection and elegance."
    },
    {
        id: 2,
        name: "Spring Tulip Melody",
        price: 65.00,
        image: "assets/tulip.png",
        description: "A vibrant burst of spring, featuring a kaleidoscope of premium tulips. This arrangement brings the fresh essence of a sun-drenched garden into any space."
    },
    {
        id: 3,
        name: "Royal White Orchid",
        price: 120.00,
        image: "assets/orchid.png",
        description: "An architectural masterpiece of nature. This rare white orchid symbolizes purity and luxury, presented in a handcrafted artisanal pot with gold detailing."
    }
];

// Initialize Home Page
function initHomePage() {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image-wrapper">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <a href="product.html" class="view-btn" onclick="saveProduct(${product.id})">View Product</a>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Save selected product to localStorage
function saveProduct(id) {
    const product = products.find(p => p.id === id);
    localStorage.setItem('selectedProduct', JSON.stringify(product));
}

// Load Product Details Page
function loadProductDetails() {
    const container = document.getElementById('product-details-container');
    if (!container) return;

    const savedProduct = localStorage.getItem('selectedProduct');
    if (!savedProduct) {
        container.innerHTML = '<h2>Product not found. <a href="index.html">Go back</a></h2>';
        return;
    }

    const product = JSON.parse(savedProduct);
    
    container.innerHTML = `
        <div class="detail-image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="detail-info">
            <h1>${product.name}</h1>
            <p class="price">$${product.price.toFixed(2)}</p>
            <p class="description">${product.description}</p>
            <button class="buy-now-btn" onclick="buyNow('${product.name}')">Buy Now</button>
        </div>
    `;
}

// Buy functionality
function buyNow(productName) {
    // Show a beautiful confirmation message
    const confirmMessage = `Thank you! Your purchase of "${productName}" was successful.`;
    alert(confirmMessage);
}

// Run init on home page
document.addEventListener('DOMContentLoaded', () => {
    initHomePage();
});
