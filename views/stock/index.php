<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stock Management</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto mt-8">
        <h1 class="text-3xl font-bold mb-6">Stock Management</h1>
        <div class="flex justify-between items-center mb-6">
            <form>
                <select name="store_id" onchange="this.form.submit()" class="p-2 border rounded-lg">
                    <?php foreach ($stores as $store): ?>
                        <option value="<?= $store['id'] ?>" <?= $selected_store == $store['id'] ? 'selected' : '' ?>><?= $store['name'] ?></option>
                    <?php endforeach; ?>
                </select>
            </form>
            <div class="space-x-4">
                <a href="/stock/manage" class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">Entry/Exit</a>
                <a href="/stock/transfer" class="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600">Transfer</a>
            </div>
        </div>
        <table class="w-full bg-white rounded-lg shadow-md">
            <thead>
                <tr>
                    <th class="py-2 px-4 border-b">Product</th>
                    <th class="py-2 px-4 border-b">Quantity</th>
                    <th class="py-2 px-4 border-b">Status</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($inventory as $item): ?>
                    <tr>
                        <td class="py-2 px-4 border-b"><?= $item['product_name'] ?></td>
                        <td class="py-2 px-4 border-b"><?= $item['quantity'] ?></td>
                        <td class="py-2 px-4 border-b">
                            <?php if ($item['quantity'] <= $item['stock_threshold']): ?>
                                <span class="text-red-500 font-bold">Low Stock</span>
                            <?php else: ?>
                                <span class="text-green-500">In Stock</span>
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</body>
</html>
