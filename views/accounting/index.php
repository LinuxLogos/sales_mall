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
        <div class="grid grid-cols-3 gap-8">
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h2 class="text-xl font-bold mb-2">Total Sales</h2>
                <p class="text-3xl text-green-500"><?= number_format($sales, 2) ?> €</p>
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

        <div class="mt-8">
            <h2 class="text-2xl font-bold mb-4">Expenses</h2>
            <a href="/accounting/expenses/create" class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 mb-4 inline-block">Add Expense</a>
            <table class="w-full bg-white rounded-lg shadow-md">
                <thead>
                    <tr>
                        <th class="py-2 px-4 border-b">Date</th>
                        <th class="py-2 px-4 border-b">Description</th>
                        <th class="py-2 px-4 border-b">Amount</th>
                        <th class="py-2 px-4 border-b">Store</th>
                        <th class="py-2 px-4 border-b">User</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($expenses as $expense): ?>
                        <tr>
                            <td class="py-2 px-4 border-b"><?= $expense['created_at'] ?></td>
                            <td class="py-2 px-4 border-b"><?= $expense['description'] ?></td>
                            <td class="py-2 px-4 border-b text-red-500"><?= number_format($expense['amount'], 2) ?> €</td>
                            <td class="py-2 px-4 border-b"><?= $expense['store_name'] ?></td>
                            <td class="py-2 px-4 border-b"><?= $expense['user_name'] ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
