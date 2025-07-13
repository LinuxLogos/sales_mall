<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Customers</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto mt-8">
        <h1 class="text-3xl font-bold mb-6">Customers</h1>
        <table class="w-full bg-white rounded-lg shadow-md">
            <thead>
                <tr>
                    <th class="py-2 px-4 border-b">ID</th>
                    <th class="py-2 px-4 border-b">Name</th>
                    <th class="py-2 px-4 border-b">Email</th>
                    <th class="py-2 px-4 border-b">Phone</th>
                    <th class="py-2 px-4 border-b">Loyalty Points</th>
                    <th class="py-2 px-4 border-b">Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($customers as $customer): ?>
                    <tr>
                        <td class="py-2 px-4 border-b"><?= $customer['id'] ?></td>
                        <td class="py-2 px-4 border-b"><?= $customer['name'] ?></td>
                        <td class="py-2 px-4 border-b"><?= $customer['email'] ?></td>
                        <td class="py-2 px-4 border-b"><?= $customer['phone'] ?></td>
                        <td class="py-2 px-4 border-b"><?= $customer['loyalty_points'] ?></td>
                        <td class="py-2 px-4 border-b">
                            <a href="/customers/edit/<?= $customer['id'] ?>" class="text-blue-500 hover:underline">Edit</a>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</body>
</html>
