<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Customer Details</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto mt-8">
        <div class="bg-white p-8 rounded-lg shadow-md">
            <h1 class="text-3xl font-bold mb-6"><?= $customer['name'] ?></h1>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p><strong>Email:</strong> <?= $customer['email'] ?></p>
                    <p><strong>Phone:</strong> <?= $customer['phone'] ?></p>
                    <p><strong>Address:</strong> <?= $customer['address'] ?></p>
                </div>
                <div>
                    <p><strong>Loyalty Points:</strong> <?= $customer['loyalty_points'] ?></p>
                    <p><strong>Segment:</strong> <?= $customer['segment'] ?></p>
                </div>
            </div>
        </div>

        <div class="mt-8">
            <h2 class="text-2xl font-bold mb-4">Transaction History</h2>
            <table class="w-full bg-white rounded-lg shadow-md">
                <thead>
                    <tr>
                        <th class="py-2 px-4 border-b">Invoice ID</th>
                        <th class="py-2 px-4 border-b">Date</th>
                        <th class="py-2 px-4 border-b">Total Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($transactions as $transaction): ?>
                        <tr>
                            <td class="py-2 px-4 border-b"><?= $transaction['id'] ?></td>
                            <td class="py-2 px-4 border-b"><?= $transaction['created_at'] ?></td>
                            <td class="py-2 px-4 border-b"><?= number_format($transaction['total_amount'], 2) ?> €</td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
