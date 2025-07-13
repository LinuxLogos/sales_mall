<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accounting</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto mt-8">
        <h1 class="text-3xl font-bold mb-6">Accounting</h1>
        <div class="flex justify-between items-center mb-6">
            <div class="flex space-x-4">
                <a href="?period=daily" class="py-2 px-4 rounded-lg <?= ($_GET['period'] ?? 'daily') == 'daily' ? 'bg-blue-500 text-white' : 'bg-white' ?>">Daily</a>
                <a href="?period=weekly" class="py-2 px-4 rounded-lg <?= ($_GET['period'] ?? '') == 'weekly' ? 'bg-blue-500 text-white' : 'bg-white' ?>">Weekly</a>
                <a href="?period=monthly" class="py-2 px-4 rounded-lg <?= ($_GET['period'] ?? '') == 'monthly' ? 'bg-blue-500 text-white' : 'bg-white' ?>">Monthly</a>
            </div>
            <div class="space-x-4">
                <a href="/accounting/export/csv?period=<?= $_GET['period'] ?? 'daily' ?>" class="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600">Export CSV</a>
                <a href="/accounting/export/pdf?period=<?= $_GET['period'] ?? 'daily' ?>" class="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600">Export PDF</a>
            </div>
        </div>
        <div class="grid grid-cols-4 gap-8">
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h2 class="text-xl font-bold mb-2">Total Sales</h2>
                <p class="text-3xl text-green-500"><?= number_format($total_sales, 2) ?> €</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h2 class="text-xl font-bold mb-2">Total Taxes</h2>
                <p class="text-3xl text-blue-500"><?= number_format($total_taxes, 2) ?> €</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h2 class="text-xl font-bold mb-2">Total Expenses</h2>
                <p class="text-3xl text-red-500"><?= number_format($total_expenses, 2) ?> €</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h2 class="text-xl font-bold mb-2">Balance</h2>
                <p class="text-3xl <?= $balance >= 0 ? 'text-green-500' : 'text-red-500' ?>"><?= number_format($balance, 2) ?> €</p>
            </div>
        </div>

        <div class="mt-8 grid grid-cols-2 gap-8">
            <div>
                <h2 class="text-2xl font-bold mb-4">Sales Report</h2>
                <table class="w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr>
                            <th class="py-2 px-4 border-b">Date</th>
                            <th class="py-2 px-4 border-b">Sales</th>
                            <th class="py-2 px-4 border-b">Taxes</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($sales as $sale): ?>
                            <tr>
                                <td class="py-2 px-4 border-b"><?= $sale['date'] ?></td>
                                <td class="py-2 px-4 border-b text-green-500"><?= number_format($sale['total_sales'], 2) ?> €</td>
                                <td class="py-2 px-4 border-b text-blue-500"><?= number_format($sale['total_taxes'], 2) ?> €</td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
            <div>
                <h2 class="text-2xl font-bold mb-4">Expenses Report</h2>
                <a href="/accounting/expenses/create" class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 mb-4 inline-block">Add Expense</a>
                <table class="w-full bg-white rounded-lg shadow-md">
                    <thead>
                        <tr>
                            <th class="py-2 px-4 border-b">Date</th>
                            <th class="py-2 px-4 border-b">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($expenses as $expense): ?>
                            <tr>
                                <td class="py-2 px-4 border-b"><?= $expense['date'] ?></td>
                                <td class="py-2 px-4 border-b text-red-500"><?= number_format($expense['total_expenses'], 2) ?> €</td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>
