<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @media print {
            body * {
                visibility: hidden;
            }
            #receipt, #receipt * {
                visibility: visible;
            }
            #receipt {
                position: absolute;
                left: 0;
                top: 0;
            }
        }
    </style>
</head>
<body class="bg-gray-100">
    <div id="receipt" class="container mx-auto mt-8 bg-white p-8 rounded-lg shadow-md max-w-md">
        <h1 class="text-2xl font-bold text-center mb-6">Receipt</h1>
        <div class="mb-4">
            <p><strong>Invoice ID:</strong> <?= $invoice['id'] ?></p>
            <p><strong>Date:</strong> <?= $invoice['created_at'] ?></p>
            <p><strong>Cashier:</strong> <?= $invoice['user_name'] ?></p>
            <p><strong>Customer:</strong> <?= $invoice['customer_name'] ?></p>
        </div>
        <table class="w-full mb-4">
            <thead>
                <tr>
                    <th class="py-2 border-b text-left">Product</th>
                    <th class="py-2 border-b text-center">Quantity</th>
                    <th class="py-2 border-b text-right">Price</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($items as $item): ?>
                    <tr>
                        <td class="py-2"><?= $item['product_name'] ?></td>
                        <td class="py-2 text-center"><?= $item['quantity'] ?></td>
                        <td class="py-2 text-right"><?= number_format($item['unit_price'], 2) ?> €</td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
        <div class="text-right">
            <p><strong>Subtotal:</strong> <?= number_format($invoice['total_amount'] - $invoice['tax_amount'], 2) ?> €</p>
            <p><strong>Tax (<?= $invoice['tax_rate'] ?>%):</strong> <?= number_format($invoice['tax_amount'], 2) ?> €</p>
            <p class="font-bold text-xl"><strong>Total:</strong> <?= number_format($invoice['total_amount'], 2) ?> €</p>
        </div>
    </div>
    <div class="text-center mt-4">
        <button onclick="window.print()" class="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">Print Receipt</button>
    </div>
</body>
</html>
