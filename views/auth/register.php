<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
</head>
<body class="bg-gray-100">
    <div class="flex items-center justify-center min-h-screen">
        <div class="form-container bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h2 class="text-2xl font-bold mb-6 text-center">Register</h2>
            <form action="/register" method="POST">
                <div class="mb-4">
                    <label for="username" class="block text-gray-700">Username</label>
                    <input type="text" id="username" name="username" class="w-full px-3 py-2 border rounded-lg" required>
                </div>
                <div class="mb-4">
                    <label for="email" class="block text-gray-700">Email</label>
                    <input type="email" id="email" name="email" class="w-full px-3 py-2 border rounded-lg" required>
                </div>
                <div class="mb-4">
                    <label for="password" class="block text-gray-700">Password</label>
                    <input type="password" id="password" name="password" class="w-full px-3 py-2 border rounded-lg" required>
                </div>
                <div class="mb-6">
                    <label for="role_id" class="block text-gray-700">Role</label>
                    <select id="role_id" name="role_id" class="w-full px-3 py-2 border rounded-lg" required>
                        <option value="1">Admin</option>
                        <option value="2">Manager</option>
                        <option value="3">Seller</option>
                        <option value="4">Analyst</option>
                    </select>
                </div>
                <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">Register</button>
            </form>
        </div>
    </div>
    <script>
        gsap.from(".form-container", {
            duration: 1,
            y: -50,
            opacity: 0,
            ease: "power2.out"
        });
    </script>
</body>
</html>
