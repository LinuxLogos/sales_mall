<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stock Entry/Exit</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto mt-8">
        <h1 class="text-3xl font-bold mb-6">Stock Entry/Exit</h1>
        <form action="/stock/manage" method="POST" class="bg-white p-8 rounded-lg shadow-md">
            <div class="mb-4">
                <label for="product_id" class="block text-gray-700">Product</label>
                <select id="product_id" name="product_id" class="w-full px-3 py-2 border rounded-lg" required>
                    <?php foreach ($products as $product): ?>
                        <option value="<?= $product['id'] ?>"><?= $product['name'] ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="mb-4">
                <label for="store_id" class="block text-gray-700">Store</label>
                <select id="store_id" name="store_id" class="w-full px-3 py-2 border rounded-lg" required>
                    <?php foreach ($stores as $store): ?>
                        <option value="<?= $store['id'] ?>"><?= $store['name'] ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="mb-4">
                <label for="quantity" class="block text-gray-700">Quantity</label>
                <input type="number" id="quantity" name="quantity" class="w-full px-3 py-2 border rounded-lg" required>
            </div>
            <div class="mb-6">
                <label for="type" class="block text-gray-700">Type</label>
                <select id="type" name="type" class="w-full px-3 py-2 border rounded-lg" required>
                    <option value="in">Entry</option>
                    <option value="out">Exit</option>
                </select>
            </div>
            <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">Submit</button>
        </form>
    </div>
</body>
</html>
