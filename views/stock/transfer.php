<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stock Transfer</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto mt-8">
        <h1 class="text-3xl font-bold mb-6">Stock Transfer</h1>
        <form action="/stock/transfer" method="POST" class="bg-white p-8 rounded-lg shadow-md">
            <div class="mb-4">
                <label for="product_id" class="block text-gray-700">Product</label>
                <select id="product_id" name="product_id" class="w-full px-3 py-2 border rounded-lg" required>
                    <?php foreach ($products as $product): ?>
                        <option value="<?= $product['id'] ?>"><?= $product['name'] ?></option>
                    <?php endforeach; ?>
                </select>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="mb-4">
                    <label for="from_store_id" class="block text-gray-700">From Store</label>
                    <select id="from_store_id" name="from_store_id" class="w-full px-3 py-2 border rounded-lg" required>
                        <?php foreach ($stores as $store): ?>
                            <option value="<?= $store['id'] ?>"><?= $store['name'] ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="mb-4">
                    <label for="to_store_id" class="block text-gray-700">To Store</label>
                    <select id="to_store_id" name="to_store_id" class="w-full px-3 py-2 border rounded-lg" required>
                        <?php foreach ($stores as $store): ?>
                            <option value="<?= $store['id'] ?>"><?= $store['name'] ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>
            <div class="mb-6">
                <label for="quantity" class="block text-gray-700">Quantity</label>
                <input type="number" id="quantity" name="quantity" class="w-full px-3 py-2 border rounded-lg" required>
            </div>
            <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">Transfer</button>
        </form>
    </div>
</body>
</html>
