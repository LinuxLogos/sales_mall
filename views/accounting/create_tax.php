<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Tax</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto mt-8">
        <h1 class="text-3xl font-bold mb-6">Add Tax</h1>
        <form action="/accounting/taxes/create" method="POST" class="bg-white p-8 rounded-lg shadow-md">
            <div class="mb-4">
                <label for="name" class="block text-gray-700">Name</label>
                <input type="text" id="name" name="name" class="w-full px-3 py-2 border rounded-lg" required>
            </div>
            <div class="mb-4">
                <label for="rate" class="block text-gray-700">Rate (%)</label>
                <input type="number" step="0.01" id="rate" name="rate" class="w-full px-3 py-2 border rounded-lg" required>
            </div>
            <div class="mb-6">
                <label for="is_default" class="flex items-center">
                    <input type="checkbox" id="is_default" name="is_default" value="1" class="mr-2">
                    Default Tax
                </label>
            </div>
            <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">Add Tax</button>
        </form>
    </div>
</body>
</html>
