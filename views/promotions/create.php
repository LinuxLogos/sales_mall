<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Promotion</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto mt-8">
        <h1 class="text-3xl font-bold mb-6">Add Promotion</h1>
        <form action="/promotions/create" method="POST" class="bg-white p-8 rounded-lg shadow-md">
            <div class="mb-4">
                <label for="code" class="block text-gray-700">Code (optional)</label>
                <input type="text" id="code" name="code" class="w-full px-3 py-2 border rounded-lg">
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="mb-4">
                    <label for="type" class="block text-gray-700">Type</label>
                    <select id="type" name="type" class="w-full px-3 py-2 border rounded-lg" required>
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label for="value" class="block text-gray-700">Value</label>
                    <input type="number" step="0.01" id="value" name="value" class="w-full px-3 py-2 border rounded-lg" required>
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="mb-4">
                    <label for="start_date" class="block text-gray-700">Start Date (optional)</label>
                    <input type="datetime-local" id="start_date" name="start_date" class="w-full px-3 py-2 border rounded-lg">
                </div>
                <div class="mb-4">
                    <label for="end_date" class="block text-gray-700">End Date (optional)</label>
                    <input type="datetime-local" id="end_date" name="end_date" class="w-full px-3 py-2 border rounded-lg">
                </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
                <div class="mb-4">
                    <label for="applicable_to" class="block text-gray-700">Applicable To</label>
                    <select id="applicable_to" name="applicable_to" class="w-full px-3 py-2 border rounded-lg" required>
                        <option value="product">Product</option>
                        <option value="category">Category</option>
                        <option value="customer">Customer</option>
                    </select>
                </div>
                <div class="mb-4">
                    <label for="applicable_id" class="block text-gray-700">Applicable ID</label>
                    <input type="number" id="applicable_id" name="applicable_id" class="w-full px-3 py-2 border rounded-lg">
                </div>
            </div>
            <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">Add Promotion</button>
        </form>
    </div>
</body>
</html>
