document.getElementById('loginForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!username || !password) {
        alert('Please enter both username and password.');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/auth/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const error = await response.json();
            alert(error.message || 'Login failed');
            return;
        }

        const data = await response.json();

        if (data.isBanned) {
            alert('Your account is banned. Please contact support.');
            return;
        }

        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);

        window.location.href = data.user.role === 'admin'
            ? '/statics/admin/index.html'
            : '/statics/homepage/index.html';

    } catch (error) {
        console.error('Error during signin:', error);
        alert('An error occurred. Please try again later.');
    }
});
