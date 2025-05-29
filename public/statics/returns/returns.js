// DOM elements
const returnList = document.getElementById('returnList');
const startDateInput = document.getElementById('filterStartDate');
const endDateInput = document.getElementById('filterEndDate');
const applyFilterBtn = document.getElementById('applyFilter');
const resetFilterBtn = document.getElementById('resetFilter');
const logoutBtn = document.getElementById('logoutBtn');

let originalReturnData = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchReturns();
    applyFilterBtn.addEventListener('click', filterByDate);
    resetFilterBtn.addEventListener('click', resetFilter);
    logoutBtn.addEventListener('click', logout);
});

// Fetch returns from server
async function fetchReturns() {
    try {
        const response = await fetch('/api/admin/returns', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (!response.ok) throw new Error('Failed to fetch returns');

        const returns = await response.json();
        originalReturnData = returns;
        displayReturns(returns);
    } catch (error) {
        console.error('Error fetching returns:', error.message);
    }
}

// Render returns
function displayReturns(data) {
    returnList.innerHTML = data.length ? '' : '<tr><td colspan="4" class="text-center p-4">No returns found</td></tr>';

    data.forEach(({ BorrowedBookID, Title, Username, ReturnDate }) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-4 border">${Title}</td>
            <td class="p-4 border">${Username || 'N/A'}</td>
            <td class="p-4 border">${new Date(ReturnDate).toLocaleDateString()}</td>
            <td class="p-4 border">
                <button class="btn-success" onclick="confirmReturn('${BorrowedBookID}')">Confirm</button>
            </td>
        `;
        returnList.appendChild(row);
    });
}

// Confirm return
async function confirmReturn(returnId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found. Please log in again.');

        const response = await fetch(`/api/admin/confirm-return/${returnId}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to confirm return');

        alert('Return confirmed successfully!');
        fetchReturns();
    } catch (error) {
        console.error('Error confirming return:', error.message);
        alert(`Failed to confirm return: ${error.message}`);
    }
}

// Filter by date
function filterByDate() {
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    if (!startDate || !endDate || startDate > endDate) {
        alert('Please select a valid date range.');
        return;
    }

    const filtered = originalReturnData.filter(({ returnDate }) => {
        const date = new Date(returnDate);
        return date >= startDate && date <= endDate;
    });

    displayReturns(filtered);
}

// Reset filter
function resetFilter() {
    startDateInput.value = '';
    endDateInput.value = '';
    displayReturns(originalReturnData);
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('You have logged out.');
    window.location.href = '/statics/signin/index.html';
}
