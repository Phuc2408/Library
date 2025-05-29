document.getElementById('signupForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    const id = document.getElementById('id').value;
    const phone = document.getElementById('phone').value;
    const isBanned = false;
    const gender = document.querySelector('input[name="gender"]:checked')?.value;

    if (!email || !username || !password || !gender || !name || !id || !phone) {
        alert('Please fill all fields');
        return;
    }

    const userData = {
        email: email,
        username: username,
        password: password,
        name: name,
        id: id,
        phone: phone,
        gender: gender,
        isBanned: isBanned
    };

    try {
        const response = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            const result = await response.json();
            alert('Sign up successful! Please log in.');
            window.location.href = 'statics/signin.html';
        } else {
            const error = await response.json();
            alert(`Error: ${error.message || 'Something went wrong'}`);
        }
    } catch (err) {
        console.error('Error:', err);
        alert('An error occurred. Please try again later.');
    }
});
