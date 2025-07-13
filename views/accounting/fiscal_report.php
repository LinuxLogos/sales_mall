<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fiscal Report</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto mt-8">
        <h1 class="text-3xl font-bold mb-6">Fiscal Report</h1>
        <div class="flex space-x-4 mb-6">
            <a href="?period=daily" class="py-2 px-4 rounded-lg <?= ($_GET['period'] ?? 'monthly') == 'daily' ? 'bg-blue-500 text-white' : 'bg-white' ?>">Daily</a>
            <a href="?period=weekly" class="py-2 px-4 rounded-lg <?= ($_GET['period'] ?? '') == 'weekly' ? 'bg-blue-500 text-white' : 'bg-white' ?>">Weekly</a>
            <a href="?period=monthly" class="py-2 px-4 rounded-lg <?= ($_GET['period'] ?? '') == 'monthly' ? 'bg-blue-500 text-white' : 'bg-white' ?>">Monthly</a>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-xl font-bold mb-2">Total Taxes Collected</h2>
            <p class="text-3xl text-blue-500"><?= number_format($total_taxes, 2) ?> €</p>
        </div>
    </div>
</body>
</html>
