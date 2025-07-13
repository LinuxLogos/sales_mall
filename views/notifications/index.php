<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notifications</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto mt-8">
        <h1 class="text-3xl font-bold mb-6">Notifications</h1>
        <div class="space-y-4">
            <?php foreach ($notifications as $notification): ?>
                <div class="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                    <div>
                        <p class="font-bold"><?= ucfirst(str_replace('_', ' ', $notification['type'])) ?></p>
                        <p><?= $notification['message'] ?></p>
                        <p class="text-sm text-gray-500"><?= $notification['created_at'] ?></p>
                    </div>
                    <a href="/notifications/mark_as_read/<?= $notification['id'] ?>" class="text-blue-500 hover:underline">Mark as read</a>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</body>
</html>
