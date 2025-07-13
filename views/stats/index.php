<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Statistics & Forecasts</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto p-6">
        <h1 class="text-3xl font-bold mb-6">Statistics & Forecasts</h1>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h2 class="text-xl font-bold mb-4">Sales Trend (Monthly)</h2>
                <canvas id="salesTrendChart"></canvas>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h2 class="text-xl font-bold mb-4">Top 5 Best-Selling Products</h2>
                <canvas id="bestSellingChart"></canvas>
            </div>
        </div>

        <div class="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-xl font-bold mb-4">Purchase Suggestions</h2>
            <table class="w-full">
                <thead>
                    <tr>
                        <th class="py-2 px-4 border-b text-left">Product</th>
                        <th class="py-2 px-4 border-b text-right">Suggested Quantity to Purchase</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($suggestions as $suggestion): ?>
                        <tr>
                            <td class="py-2 px-4 border-b"><?= $suggestion['name'] ?></td>
                            <td class="py-2 px-4 border-b text-right"><?= $suggestion['needed'] ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>

    <script>
        // Sales Trend Chart
        const salesTrendCtx = document.getElementById('salesTrendChart').getContext('2d');
        const salesTrendChart = new Chart(salesTrendCtx, {
            type: 'line',
            data: {
                labels: <?= json_encode(array_column($sales_by_month, 'month')) ?>,
                datasets: [{
                    label: 'Monthly Sales',
                    data: <?= json_encode(array_column($sales_by_month, 'total')) ?>,
                    borderColor: 'rgba(63, 131, 248, 1)',
                    backgroundColor: 'rgba(63, 131, 248, 0.2)',
                }]
            }
        });

        // Best Selling Chart
        const bestSellingCtx = document.getElementById('bestSellingChart').getContext('2d');
        const bestSellingChart = new Chart(bestSellingCtx, {
            type: 'bar',
            data: {
                labels: <?= json_encode(array_column($best_selling, 'name')) ?>,
                datasets: [{
                    label: 'Total Quantity Sold',
                    data: <?= json_encode(array_column($best_selling, 'total_quantity')) ?>,
                    backgroundColor: 'rgba(34, 197, 94, 0.5)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 1
                }]
            }
        });
    </script>
</body>
</html>
