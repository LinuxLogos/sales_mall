<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Expense</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto mt-8">
        <h1 class="text-3xl font-bold mb-6">Add Expense</h1>
        <form action="/accounting/expenses/create" method="POST" class="bg-white p-8 rounded-lg shadow-md">
            <div class="mb-4">
                <label for="description" class="block text-gray-700">Description</label>
                <textarea id="description" name="description" class="w-full px-3 py-2 border rounded-lg" required></textarea>
            </div>
            <div class="mb-4">
                <label for="amount" class="block text-gray-700">Amount</label>
                <input type="number" step="0.01" id="amount" name="amount" class="w-full px-3 py-2 border rounded-lg" required>
            </div>
            <div class="mb-6">
                <label for="store_id" class="block text-gray-700">Store</label>
                <select id="store_id" name="store_id" class="w-full px-3 py-2 border rounded-lg">
                    <option value="">Select Store</option>
                    <?php foreach ($stores as $store): ?>
                        <option value="<?= $store['id'] ?>"><?= $store['name'] ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">Add Expense</button>
        </form>
    </div>
</body>
</html>
