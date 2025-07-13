<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Taxes</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto mt-8">
        <h1 class="text-3xl font-bold mb-6">Taxes</h1>
        <a href="/accounting/taxes/create" class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 mb-4 inline-block">Add Tax</a>
        <table class="w-full bg-white rounded-lg shadow-md">
            <thead>
                <tr>
                    <th class="py-2 px-4 border-b">Name</th>
                    <th class="py-2 px-4 border-b">Rate</th>
                    <th class="py-2 px-4 border-b">Default</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($taxes as $tax): ?>
                    <tr>
                        <td class="py-2 px-4 border-b"><?= $tax['name'] ?></td>
                        <td class="py-2 px-4 border-b"><?= $tax['rate'] ?>%</td>
                        <td class="py-2 px-4 border-b"><?= $tax['is_default'] ? 'Yes' : 'No' ?></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</body>
</html>
