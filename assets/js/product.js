let allProducts = [];
let cart = [];

const config = {
    currencySymbol: "₳"
};

async function fetchProducts() {
    try {
        const response = await fetch('https://dummyjson.com/products');
        const data = await response.json();
        const modifiedProducts = data.products.map(product => ({
            ...product,
            thumbnail: product.thumbnail.replace('https://i.dummyjason.com/data/products', './assets/pro-images/${product.id}.jpg')
        }));
        return modifiedProducts;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

function createProductCard(product) {
    return `
        <div class="bg-white rounded-lg shadow-md overflow-hidden flex flex-col cursor-pointer" onclick="showProductDetails(${product.id})">
            <img src="./assets/pro-images/${product.id}.jpg" alt="${product.title}" class="w-full h-48 object-cover">
            <div class="p-4 flex-grow flex flex-col">
                <span class="text-2xl font-bold text-blue-600 mt-auto">${config.currencySymbol}${product.price.toFixed(2)}</span>
            </div>
        </div>
    `;
}

function showProductDetails(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) {
        const modalContent = `
            <img src="./assets/pro-images/${product.id}.jpg" alt="${product.title}" class="w-full h-64 object-cover mb-4 rounded">
            <p class="text-xl font-bold text-blue-600 mb-2">${config.currencySymbol}${product.price.toFixed(2)}</p>
            <p class="mb-2">Category: ${product.category}</p>
            <p class="mb-2">Brand: ${product.brand}</p>
            <p class="mb-4">Rating: ${product.rating}/5</p>
            <div class="flex items-center gap-4">
                <label for="quantity" class="font-semibold">Quantity:</label>
                <input type="number" id="quantity" min="1" value="1" class="border rounded p-2 w-20">
                <button onclick="addToCart(${product.id})" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                    Add to Cart
                </button>
            </div>
        `;
        document.getElementById('modalContent').innerHTML = modalContent;
        document.getElementById('productModal').classList.remove('hidden');
    }
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    const quantity = parseInt(document.getElementById('quantity').value);
    if (product && quantity > 0) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ ...product, quantity });
        }
        updateCart();
        saveCartToLocalStorage();
        document.getElementById('productModal').classList.add('hidden');
    }
}

function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index !== -1) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
        updateCart();
        saveCartToLocalStorage();
    }
}

function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartCount = document.getElementById('cartCount');

    cartItems.innerHTML = '';
    let total = 0;
    let count = 0;

    cart.forEach(item => {
        cartItems.innerHTML += `
            <li class="flex justify-between items-center mb-2">
                <span>${item.title} (x${item.quantity})</span>
                <div>
                    <span>${config.currencySymbol}${(item.price * item.quantity).toFixed(2)}</span>
                    <button onclick="removeFromCart(${item.id})" class="ml-2 text-red-600 hover:text-red-800">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </li>`;
        total += item.price * item.quantity;
        count += item.quantity;
    });

    cartTotal.textContent = total.toFixed(2);
    cartCount.textContent = count;
}

function saveCartToLocalStorage() {
    // Save cart items array (existing functionality)
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // NEW: Save cart in the format expected by payment gateway
    const cartForPaymentGateway = {
        items: cart.map(item => ({
            name: item.title,
            quantity: item.quantity,
            price: item.price,
            id: item.id,
            category: item.category || 'general',
            brand: item.brand || 'N/A'
        })),
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('coxygenCart', JSON.stringify(cartForPaymentGateway));
    
    console.log('Cart saved to localStorage:', cartForPaymentGateway);
}

function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCart();
    }
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;

    const filteredProducts = allProducts.filter(product => 
        product.title.toLowerCase().includes(searchTerm) &&
        (category === '' || product.category === category)
    );

    displayProducts(filteredProducts);
}

function displayProducts(products) {
    const productsContainer = document.getElementById('products');
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.innerHTML += productCard;
    });
}

function populateCategories(products) {
    const categories = [...new Set(products.map(p => p.category))];
    const categoryFilter = document.getElementById('categoryFilter');
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

function checkout() {
    // Check if cart is empty
    if (cart.length === 0) {
        alert('Your cart is empty! Please add items before checking out.');
        return;
    }
    
    // Calculate total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Save cart one final time before redirecting
    saveCartToLocalStorage();
    
    console.log('Redirecting to checkout with cart:', {
        items: cart.length,
        total: total
    });
    
    // Show alert with checkout information
    alert(`Total Amount: ${config.currencySymbol}${total.toFixed(2)}\n\nRedirecting to payment gateway...\n\nDue to market volatility, please pay the current ADA equivalent of your total.`);
    
    // Small delay to ensure localStorage is written
    setTimeout(() => {
        // Redirect to payment gateway (checkout.html)
        window.location.href = "checkout.html";
    }, 100);
}

async function initializeApp() {
    allProducts = await fetchProducts();
    displayProducts(allProducts);
    populateCategories(allProducts);
    loadCartFromLocalStorage();

    document.getElementById('searchInput').addEventListener('input', filterProducts);
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('productModal').classList.add('hidden');
    });
    document.getElementById('cartButton').addEventListener('click', () => {
        document.getElementById('cartDropdown').classList.toggle('hidden');
    });
    document.getElementById('checkoutButton').addEventListener('click', checkout);

    // Close cart dropdown when clicking outside
    document.addEventListener('click', (event) => {
        const cartDropdown = document.getElementById('cartDropdown');
        const cartButton = document.getElementById('cartButton');
        if (!cartButton.contains(event.target) && !cartDropdown.contains(event.target)) {
        
            cartDropdown.classList.add('hidden');
        }
    });

    // Hide preloader
    document.getElementById('preloader').classList.add('hidden');
}

initializeApp();