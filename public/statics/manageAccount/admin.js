let accountData = [];
const itemsPerPage = 10;
let currentPage = 1;

async function loadUsers() {
  try {
    const response = await fetch('http://localhost:5000/api/users');
    const data = await response.json();
    const usersOnly = data.filter(user => user.Role === 'user');

    accountData = usersOnly.map(user => ({
      id: user.UserId,        
      name: user.Name,        
      email: user.Email,      
      isBanned: user.IsBanned 
    }));

    renderTable(accountData, currentPage);
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

function renderTable(data, page) {
  const startIdx = (page - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const pageData = data.slice(startIdx, endIdx);
  const tableBody = document.getElementById('accountTableBody');
  tableBody.innerHTML = '';

  pageData.forEach(account => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="px-4 py-2">${account.id}</td>
      <td class="px-4 py-2">${account.name}</td>
      <td class="px-4 py-2">${account.email}</td>
      <td class="px-4 py-2">${account.isBanned ? 'Banned' : 'Active'}</td>
      <td class="px-4 py-2">
        <button class="bg-red-500 text-white px-2 py-1 rounded" onclick="deleteUser('${account.id}')">Delete</button>
        <button class="bg-yellow-500 text-white px-2 py-1 rounded" onclick="toggleBanUser('${account.id}', ${!account.isBanned})">
          ${account.isBanned ? 'Unban' : 'Ban'}
        </button>
        <button class="bg-blue-500 text-white px-2 py-1 rounded" onclick="resetPassword('${account.id}')">Reset PW</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  document.getElementById('pageInfo').textContent = `Page ${page} of ${Math.ceil(data.length / itemsPerPage)}`;
  document.getElementById('prevBtn').disabled = page === 1;
  document.getElementById('nextBtn').disabled = page === Math.ceil(data.length / itemsPerPage);
}

document.getElementById('prevBtn').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable(accountData, currentPage);
  }
});

document.getElementById('nextBtn').addEventListener('click', () => {
  if (currentPage < Math.ceil(accountData.length / itemsPerPage)) {
    currentPage++;
    renderTable(accountData, currentPage);
  }
});

document.getElementById('signupForm').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.target;
  const userData = {
    email: form.email.value,
    username: form.username.value,
    password: '123456',
    name: form.name.value,
    id: form.id.value,
    phone: form.phone.value,
    gender: form.gender.value,
    isBanned: false
  };

  if (Object.values(userData).some(v => !v)) {
    alert('Please fill all fields');
    return;
  }

  try {
    const response = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    if (response.ok) {
      alert('User created successfully');
      document.querySelector('.model').style.display = 'none';
      loadUsers();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message || 'Something went wrong'}`);
    }
  } catch (err) {
    console.error('Error creating user:', err);
    alert('An error occurred. Please try again later.');
  }
});

async function deleteUser(id) {
  try {
    const response = await fetch(`http://localhost:5000/api/users/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      alert('User deleted successfully!');
      loadUsers();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message || 'Something went wrong'}`);
    }
  } catch (err) {
    console.error('Error deleting user:', err);
    alert('An error occurred. Please try again later.');
  }
}

async function toggleBanUser(id, value) {
  try {
    const response = await fetch(`http://localhost:5000/api/users/${id}?value=${value}`, {
      method: 'PATCH'
    });

    if (response.ok) {
      alert('User ban status updated successfully!');
      loadUsers();
    } else {
      const error = await response.json();
      alert(`Error: ${error.message || 'Something went wrong'}`);
    }
  } catch (err) {
    console.error('Error toggling ban status:', err);
    alert('An error occurred. Please try again later.');
  }
}

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = '/statics/signin/index.html';
});

// Initial load
loadUsers();

function createUser() {
  document.querySelector('.model').style.display = 'block';
}
async function resetPassword(userId) {
  const confirmed = confirm("Are you sure you want to reset this user's password to '123456'?");
  if (!confirmed) return;

  try {
    const response = await fetch(`http://localhost:5000/api/users/${userId}/reset-password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: '123456' })
    });

    if (response.ok) {
      alert("Password reset successfully to '123456'");
    } else {
      const error = await response.json();
      alert(`Failed to reset password: ${error.message || 'Unknown error'}`);
    }
  } catch (err) {
    console.error('Error resetting password:', err);
    alert('An error occurred. Please try again later.');
  }
}