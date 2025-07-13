<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Customer</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto mt-8">
        <h1 class="text-3xl font-bold mb-6">Edit Customer</h1>
        <form action="/customers/edit/<?= $customer['id'] ?>" method="POST" class="bg-white p-8 rounded-lg shadow-md mb-8">
            <div class="mb-4">
                <label for="name" class="block text-gray-700">Name</label>
                <input type="text" id="name" name="name" value="<?= $customer['name'] ?>" class="w-full px-3 py-2 border rounded-lg" required>
            </div>
            <div class="mb-4">
                <label for="email" class="block text-gray-700">Email</label>
                <input type="email" id="email" name="email" value="<?= $customer['email'] ?>" class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div class="mb-4">
                <label for="phone" class="block text-gray-700">Phone</label>
                <input type="tel" id="phone" name="phone" value="<?= $customer['phone'] ?>" class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div class="mb-4">
                <label for="address" class="block text-gray-700">Address</label>
                <textarea id="address" name="address" class="w-full px-3 py-2 border rounded-lg"><?= $customer['address'] ?></textarea>
            </div>
            <div class="mb-4">
                <label for="loyalty_points" class="block text-gray-700">Loyalty Points</label>
                <input type="number" id="loyalty_points" name="loyalty_points" value="<?= $customer['loyalty_points'] ?>" class="w-full px-3 py-2 border rounded-lg" required>
            </div>
            <div class="mb-6">
                <label for="segment" class="block text-gray-700">Segment</label>
                <select id="segment" name="segment" class="w-full px-3 py-2 border rounded-lg">
                    <option value="Regular" <?= $customer['segment'] == 'Regular' ? 'selected' : '' ?>>Regular</option>
                    <option value="Inactive" <?= $customer['segment'] == 'Inactive' ? 'selected' : '' ?>>Inactive</option>
                    <option value="VIP" <?= $customer['segment'] == 'VIP' ? 'selected' : '' ?>>VIP</option>
                    <option value="Strategic Supplier" <?= $customer['segment'] == 'Strategic Supplier' ? 'selected' : '' ?>>Strategic Supplier</option>
                </select>
            </div>
            <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">Update Customer</button>
        </form>

        <h2 class="text-2xl font-bold mb-4">Discounts</h2>
        <form action="/customers/<?= $customer['id'] ?>/discounts/create" method="POST" class="bg-white p-8 rounded-lg shadow-md mb-8">
            <div class="grid grid-cols-3 gap-4">
                <div class="col-span-2">
                    <label for="discount_percentage" class="block text-gray-700">Discount Percentage</label>
                    <input type="number" step="0.01" id="discount_percentage" name="discount_percentage" class="w-full px-3 py-2 border rounded-lg" required>
                </div>
                <button type="submit" class="bg-green-500 text-white py-2 rounded-lg hover:bg-green-600">Add Discount</button>
            </div>
        </form>

        <table class="w-full bg-white rounded-lg shadow-md">
            <thead>
                <tr>
                    <th class="py-2 px-4 border-b">Discount</th>
                    <th class="py-2 px-4 border-b">Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($discounts as $discount): ?>
                    <tr>
                        <td class="py-2 px-4 border-b"><?= $discount['discount_percentage'] ?>%</td>
                        <td class="py-2 px-4 border-b">
                            <a href="/customers/<?= $customer['id'] ?>/discounts/delete/<?= $discount['id'] ?>" class="text-red-500 hover:underline">Delete</a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</body>
</html>
