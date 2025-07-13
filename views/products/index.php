<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Products</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto mt-8">
        <h1 class="text-3xl font-bold mb-6">Products</h1>
        <a href="/products/create" class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">Create Product</a>
        <table class="w-full mt-6 bg-white rounded-lg shadow-md">
            <thead>
                <tr>
                    <th class="py-2 px-4 border-b">ID</th>
                    <th class="py-2 px-4 border-b">Name</th>
                    <th class="py-2 px-4 border-b">Category</th>
                    <th class="py-2 px-4 border-b">Unit</th>
                    <th class="py-2 px-4 border-b">Purchase Price</th>
                    <th class="py-2 px-4 border-b">Sale Price</th>
                    <th class="py-2 px-4 border-b">Stock Threshold</th>
                    <th class="py-2 px-4 border-b">Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($products as $product): ?>
                    <tr>
                        <td class="py-2 px-4 border-b"><?= $product['id'] ?></td>
                        <td class="py-2 px-4 border-b"><?= $product['name'] ?></td>
                        <td class="py-2 px-4 border-b"><?= $product['category_name'] ?></td>
                        <td class="py-2 px-4 border-b"><?= $product['unit_name'] ?></td>
                        <td class="py-2 px-4 border-b"><?= $product['purchase_price'] ?></td>
                        <td class="py-2 px-4 border-b"><?= $product['sale_price'] ?></td>
                        <td class="py-2 px-4 border-b"><?= $product['stock_threshold'] ?></td>
                        <td class="py-2 px-4 border-b">
                            <a href="/products/edit/<?= $product['id'] ?>" class="text-blue-500 hover:underline">Edit</a>
                            <a href="/products/delete/<?= $product['id'] ?>" class="text-red-500 hover:underline ml-4">Delete</a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</body>
</html>
