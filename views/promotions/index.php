<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Promotions</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto mt-8">
        <h1 class="text-3xl font-bold mb-6">Promotions</h1>
        <a href="/promotions/create" class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 mb-4 inline-block">Add Promotion</a>
        <table class="w-full bg-white rounded-lg shadow-md">
            <thead>
                <tr>
                    <th class="py-2 px-4 border-b">Code</th>
                    <th class="py-2 px-4 border-b">Type</th>
                    <th class="py-2 px-4 border-b">Value</th>
                    <th class="py-2 px-4 border-b">Applicable To</th>
                    <th class="py-2 px-4 border-b">Start Date</th>
                    <th class="py-2 px-4 border-b">End Date</th>
                    <th class="py-2 px-4 border-b">Status</th>
                    <th class="py-2 px-4 border-b">Actions</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($promotions as $promotion): ?>
                    <tr>
                        <td class="py-2 px-4 border-b"><?= $promotion['code'] ?></td>
                        <td class="py-2 px-4 border-b"><?= $promotion['type'] ?></td>
                        <td class="py-2 px-4 border-b"><?= $promotion['value'] ?><?= $promotion['type'] == 'percentage' ? '%' : '€' ?></td>
                        <td class="py-2 px-4 border-b"><?= $promotion['applicable_to'] ?></td>
                        <td class="py-2 px-4 border-b"><?= $promotion['start_date'] ?></td>
                        <td class="py-2 px-4 border-b"><?= $promotion['end_date'] ?></td>
                        <td class="py-2 px-4 border-b"><?= $promotion['status'] ?></td>
                        <td class="py-2 px-4 border-b">
                            <?php if ($promotion['status'] == 'pending'): ?>
                                <a href="/promotions/update_status/<?= $promotion['id'] ?>/active" class="text-green-500 hover:underline">Approve</a>
                                <a href="/promotions/update_status/<?= $promotion['id'] ?>/inactive" class="text-red-500 hover:underline ml-4">Reject</a>
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</body>
</html>
