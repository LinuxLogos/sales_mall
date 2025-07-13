<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accounting Report</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white">
    <div class="container mx-auto p-8">
        <h1 class="text-3xl font-bold mb-6">Accounting Report</h1>
        <div class="mt-8 grid grid-cols-2 gap-8">
            <div>
                <h2 class="text-2xl font-bold mb-4">Sales Report</h2>
                <table class="w-full">
                    <thead>
                        <tr>
                            <th class="py-2 px-4 border-b text-left">Date</th>
                            <th class="py-2 px-4 border-b text-right">Sales</th>
                            <th class="py-2 px-4 border-b text-right">Taxes</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($sales as $sale): ?>
                            <tr>
                                <td class="py-2 px-4 border-b"><?= $sale['date'] ?></td>
                                <td class="py-2 px-4 border-b text-right"><?= number_format($sale['total_sales'], 2) ?> €</td>
                                <td class="py-2 px-4 border-b text-right"><?= number_format($sale['total_taxes'], 2) ?> €</td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
            <div>
                <h2 class="text-2xl font-bold mb-4">Expenses Report</h2>
                <table class="w-full">
                    <thead>
                        <tr>
                            <th class="py-2 px-4 border-b text-left">Date</th>
                            <th class="py-2 px-4 border-b text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($expenses as $expense): ?>
                            <tr>
                                <td class="py-2 px-4 border-b"><?= $expense['date'] ?></td>
                                <td class="py-2 px-4 border-b text-right"><?= number_format($expense['total_expenses'], 2) ?> €</td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>
