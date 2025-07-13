<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stores</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto mt-8">
        <h1 class="text-3xl font-bold mb-6">Stores</h1>
        <a href="/stores/create" class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">Create Store</a>
        <table class="w-full mt-6 bg-white rounded-lg shadow-md">
            <thead>
                <tr>
                    <th class="py-2 px-4 border-b">ID</th>
                    <th class="py-2 px-4 border-b">Name</th>
                    <th class="py-2 px-4 border-b">Location</th>
                    <th class="py-2 px-4 border-b">Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($stores as $store): ?>
                    <tr>
                        <td class="py-2 px-4 border-b"><?= $store['id'] ?></td>
                        <td class="py-2 px-4 border-b"><?= $store['name'] ?></td>
                        <td class="py-2 px-4 border-b"><?= $store['location'] ?></td>
                        <td class="py-2 px-4 border-b">
                            <a href="/stores/edit/<?= $store['id'] ?>" class="text-blue-500 hover:underline">Edit</a>
                            <a href="/stores/delete/<?= $store['id'] ?>" class="text-red-500 hover:underline ml-4">Delete</a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</body>
</html>
