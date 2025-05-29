// Load user data from localStorage when page loads
document.addEventListener('DOMContentLoaded', function () {
    const userData = JSON.parse(localStorage.getItem('user'));

    if (!userData) {
        alert('User not logged in. Redirecting to sign in page.');
        window.location.href = '../signin/index.html';
        return;
    }

    // Debug log
    console.log("Loaded userData:", userData);

    // Set form fields with the data from userData
    const nameField = document.getElementById("name");
    const emailField = document.getElementById("email");
    const idField = document.getElementById("idNumber");
    const phoneField = document.getElementById("phone");
    const usernameLabel = document.getElementById("accountName");

    if (usernameLabel) usernameLabel.textContent = userData.username || "";
    if (nameField) nameField.value = userData.name || "";
    if (emailField) emailField.value = userData.email || "";
    if (idField) idField.value = userData.id || "";
    if (phoneField) phoneField.value = userData.phone || "";
});

// Handle the form submission to update user data in localStorage
document.getElementById('accountForm').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent form from reloading the page

    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const userData = JSON.parse(localStorage.getItem('user'));

    if (!name || !phone) {
        alert('Vui lòng nhập đầy đủ họ tên và số điện thoại');
        return;
    }

    try {
        const userId = userData.id || userData.UserId; 
        const response = await fetch(`http://localhost:5000/api/users/${userId}/update-info`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, phone })
        });

        if (response.ok) {
            const result = await response.json();
            alert('Cập nhật thông tin thành công!');

            // Cập nhật localStorage
            userData.name = name;
            userData.phone = phone;
            localStorage.setItem('user', JSON.stringify(userData));
        } else {
            const err = await response.json();
            alert(`Lỗi cập nhật: ${err.message}`);
        }
    } catch (error) {
        console.error('Lỗi:', error);
        alert('Không thể kết nối đến server.');
    }
});