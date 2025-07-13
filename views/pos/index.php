<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Point of Sale</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto p-4">
        <h1 class="text-3xl font-bold mb-6">Point of Sale</h1>
        <div class="grid grid-cols-12 gap-8">
            <!-- Product Selection -->
            <div class="col-span-7">
                <input type="text" id="search" placeholder="Search by name, barcode, or category" class="w-full p-2 border rounded-lg mb-4">
                <div id="product-list" class="grid grid-cols-4 gap-4">
                    <?php foreach ($products as $product): ?>
                        <div class="product-card bg-white p-4 rounded-lg shadow-md cursor-pointer" data-id="<?= $product['id'] ?>" data-name="<?= $product['name'] ?>" data-price="<?= $product['sale_price'] ?>">
                            <h3 class="font-bold"><?= $product['name'] ?></h3>
                            <p class="text-gray-600"><?= $product['sale_price'] ?> €</p>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- Cart -->
            <div class="col-span-5 bg-white p-6 rounded-lg shadow-md">
                <h2 class="text-2xl font-bold mb-4">Cart</h2>
                <div id="cart-items" class="mb-4"></div>
                <div class="text-2xl font-bold">Total: <span id="total">0.00</span> €</div>
                <hr class="my-4">
                <h2 class="text-2xl font-bold mb-4">Customer</h2>
                <select id="customer_id" name="customer_id" class="w-full p-2 border rounded-lg mb-4">
                    <option value="">New Customer</option>
                    <?php foreach ($customers as $customer): ?>
                        <option value="<?= $customer['id'] ?>"><?= $customer['name'] ?></option>
                    <?php endforeach; ?>
                </select>
                <div id="new-customer-fields">
                    <input type="text" id="customer_name" placeholder="Name" class="w-full p-2 border rounded-lg mb-2">
                    <input type="email" id="customer_email" placeholder="Email" class="w-full p-2 border rounded-lg mb-2">
                    <input type="tel" id="customer_phone" placeholder="Phone" class="w-full p-2 border rounded-lg mb-2">
                </div>
                <button id="checkout" class="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 mt-4">Checkout</button>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const productCards = document.querySelectorAll('.product-card');
            const cartItems = document.getElementById('cart-items');
            const totalEl = document.getElementById('total');
            const searchInput = document.getElementById('search');
            let cart = [];

            productCards.forEach(card => {
                card.addEventListener('click', () => {
                    const product = {
                        id: card.dataset.id,
                        name: card.dataset.name,
                        price: parseFloat(card.dataset.price),
                        quantity: 1
                    };
                    addToCart(product);
                });
            });

            function addToCart(product) {
                const existingProduct = cart.find(item => item.id === product.id);
                if (existingProduct) {
                    existingProduct.quantity++;
                } else {
                    cart.push(product);
                }
                renderCart();
            }

            function renderCart() {
                cartItems.innerHTML = '';
                let total = 0;
                cart.forEach(item => {
                    const itemEl = document.createElement('div');
                    itemEl.className = 'flex justify-between items-center mb-2';
                    itemEl.innerHTML = `
                        <div>
                            <h4 class="font-bold">${item.name}</h4>
                            <p class="text-gray-600">${item.price.toFixed(2)} €</p>
                        </div>
                        <input type="number" value="${item.quantity}" min="1" class="w-16 text-center border rounded-lg" data-id="${item.id}">
                    `;
                    cartItems.appendChild(itemEl);
                    total += item.price * item.quantity;
                });
                totalEl.textContent = total.toFixed(2);
            }

            cartItems.addEventListener('change', e => {
                if (e.target.tagName === 'INPUT') {
                    const id = e.target.dataset.id;
                    const quantity = parseInt(e.target.value);
                    const product = cart.find(item => item.id === id);
                    if (product) {
                        product.quantity = quantity;
                        renderCart();
                    }
                }
            });

            searchInput.addEventListener('input', () => {
                const searchTerm = searchInput.value.toLowerCase();
                productCards.forEach(card => {
                    const name = card.dataset.name.toLowerCase();
                    if (name.includes(searchTerm)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });

            const checkoutBtn = document.getElementById('checkout');

            checkoutBtn.addEventListener('click', () => {
                const data = {
                    products: cart,
                    customer_id: document.getElementById('customer_id').value,
                    customer_name: document.getElementById('customer_name').value,
                    customer_email: document.getElementById('customer_email').value,
                    customer_phone: document.getElementById('customer_phone').value,
                    total_amount: parseFloat(totalEl.textContent)
                };

                fetch('/pos/invoice', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(response => response.json())
                .then(result => {
                    window.location.href = '/pos/receipt/' + result.invoice_id;
                });
            });

            // GSAP Animations
            gsap.from('.product-card', {
                duration: 0.5,
                opacity: 0,
                y: 20,
                stagger: 0.1,
                ease: 'power2.out'
            });
        });
    </script>
</body>
</html>
