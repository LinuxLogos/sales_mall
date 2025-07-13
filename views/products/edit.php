<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Product</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto mt-8">
        <h1 class="text-3xl font-bold mb-6">Edit Product</h1>
        <form action="/products/edit/<?= $product['id'] ?>" method="POST" class="bg-white p-8 rounded-lg shadow-md">
            <div class="mb-4">
                <label for="name" class="block text-gray-700">Name</label>
                <input type="text" id="name" name="name" value="<?= $product['name'] ?>" class="w-full px-3 py-2 border rounded-lg" required>
            </div>
            <div class="mb-4">
                <label for="description" class="block text-gray-700">Description</label>
                <textarea id="description" name="description" class="w-full px-3 py-2 border rounded-lg"><?= $product['description'] ?></textarea>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="mb-4">
                    <label for="purchase_price" class="block text-gray-700">Purchase Price</label>
                    <input type="number" step="0.01" id="purchase_price" name="purchase_price" value="<?= $product['purchase_price'] ?>" class="w-full px-3 py-2 border rounded-lg" required>
                </div>
                <div class="mb-4">
                    <label for="sale_price" class="block text-gray-700">Sale Price</label>
                    <input type="number" step="0.01" id="sale_price" name="sale_price" value="<?= $product['sale_price'] ?>" class="w-full px-3 py-2 border rounded-lg" required>
                </div>
            </div>
            <div class="mb-4">
                <label for="stock_threshold" class="block text-gray-700">Stock Threshold</label>
                <input type="number" id="stock_threshold" name="stock_threshold" value="<?= $product['stock_threshold'] ?>" class="w-full px-3 py-2 border rounded-lg" required>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="mb-4">
                    <label for="category_id" class="block text-gray-700">Category</label>
                    <select id="category_id" name="category_id" class="w-full px-3 py-2 border rounded-lg">
                        <option value="">Select Category</option>
                        <?php foreach ($categories as $category): ?>
                            <option value="<?= $category['id'] ?>" <?= $product['category_id'] == $category['id'] ? 'selected' : '' ?>><?= $category['name'] ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="mb-4">
                    <label for="unit_id" class="block text-gray-700">Unit</label>
                    <select id="unit_id" name="unit_id" class="w-full px-3 py-2 border rounded-lg">
                        <option value="">Select Unit</option>
                        <?php foreach ($units as $unit): ?>
                            <option value="<?= $unit['id'] ?>" <?= $product['unit_id'] == $unit['id'] ? 'selected' : '' ?>><?= $unit['name'] ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>
            <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">Update</button>
        </form>
    </div>
</body>
</html>
