<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --primary-color: #3f83f8;
            --dark-gray: #343a40;
            --light-gray: #f4f7fa;
        }
        .sidebar {
            background-color: var(--dark-gray);
            color: white;
        }
        .sidebar a {
            color: #d1d5db;
            transition: all 0.2s;
        }
        .sidebar a:hover, .sidebar a.active {
            background-color: var(--primary-color);
            color: white;
        }
        .card {
            background-color: white;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
    </style>
</head>
<body class="bg-light-gray">
    <div class="flex h-screen">
        <!-- Sidebar -->
        <div id="sidebar" class="sidebar w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
            <a href="#" class="text-white text-2xl font-semibold uppercase hover:text-gray-300 px-4">Sales Mall</a>
            <nav>
                <a href="/dashboard" class="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700 active">
                    <i class="fas fa-tachometer-alt mr-2"></i>Dashboard
                </a>
                <a href="/products" class="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700">
                    <i class="fas fa-box mr-2"></i>Products
                </a>
                <a href="/customers" class="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700">
                    <i class="fas fa-users mr-2"></i>Customers
                </a>
                <a href="/accounting" class="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700">
                    <i class="fas fa-calculator mr-2"></i>Accounting
                </a>
                <a href="/promotions" class="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700">
                    <i class="fas fa-tags mr-2"></i>Promotions
                </a>
                <a href="/notifications" class="block py-2.5 px-4 rounded transition duration-200 hover:bg-blue-700">
                    <i class="fas fa-bell mr-2"></i>Notifications
                    <span class="ml-2 text-xs bg-red-500 text-white rounded-full px-2 py-1"><?= count($unread_notifications) ?></span>
                </a>
            </nav>
        </div>

        <!-- Content -->
        <div class="flex-1 flex flex-col overflow-hidden">
            <header class="flex justify-between items-center p-6 bg-white border-b-2 border-gray-200">
                <div class="flex items-center">
                    <button id="menu-button" class="text-gray-500 focus:outline-none lg:hidden">
                        <i class="fas fa-bars"></i>
                    </button>
                    <h1 class="text-2xl font-semibold text-gray-700 ml-4">Dashboard</h1>
                </div>
                <!-- Quick Actions -->
                <div class="flex items-center space-x-4">
                    <a href="/pos" class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"><i class="fas fa-cash-register mr-2"></i>New Sale</a>
                    <a href="/products/create" class="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"><i class="fas fa-plus mr-2"></i>Add Product</a>
                </div>
            </header>
            <main class="flex-1 overflow-x-hidden overflow-y-auto bg-light-gray p-6">
                <!-- Stat Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="card p-6">
                        <h3 class="text-gray-600">Total Sales</h3>
                        <p class="text-3xl font-bold text-green-500"><?= number_format($total_sales, 2) ?> €</p>
                    </div>
                    <div class="card p-6">
                        <h3 class="text-gray-600">Total Products</h3>
                        <p class="text-3xl font-bold text-blue-500"><?= $product_count ?></p>
                    </div>
                    <div class="card p-6">
                        <h3 class="text-gray-600">Total Customers</h3>
                        <p class="text-3xl font-bold text-yellow-500"><?= $customer_count ?></p>
                    </div>
                    <div class="card p-6">
                        <h3 class="text-gray-600">Alerts</h3>
                        <p class="text-3xl font-bold text-red-500"><?= count($unread_notifications) ?></p>
                    </div>
                </div>

                <!-- Charts -->
                <div class="mt-8">
                    <div class="card p-6">
                        <canvas id="salesChart"></canvas>
                    </div>
                </div>
            </main>
        </div>
    </div>
    <script>
        // Chart.js setup
        const salesCtx = document.getElementById('salesChart').getContext('2d');
        const salesChart = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: <?= json_encode(array_column($sales_by_day, 'date')) ?>,
                datasets: [{
                    label: 'Sales per day',
                    data: <?= json_encode(array_column($sales_by_day, 'total')) ?>,
                    backgroundColor: 'rgba(63, 131, 248, 0.2)',
                    borderColor: 'rgba(63, 131, 248, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });

        // Sidebar toggle
        const menuButton = document.getElementById('menu-button');
        const sidebar = document.getElementById('sidebar');
        menuButton.addEventListener('click', () => {
            sidebar.classList.toggle('-translate-x-full');
        });
    </script>
</body>
</html>
