// DOM elements
const pickupList = document.getElementById('pickupList');
const startDateInput = document.getElementById('filterStartDate');
const endDateInput = document.getElementById('filterEndDate');
const applyFilterBtn = document.getElementById('applyFilter');
const resetFilterBtn = document.getElementById('resetFilter');
const logoutBtn = document.getElementById('logoutBtn');

let originalPickupData = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchPickups();
    applyFilterBtn.addEventListener('click', filterByDate);
    resetFilterBtn.addEventListener('click', resetFilter);
    logoutBtn.addEventListener('click', logout);
});

// Fetch pickups from server
async function fetchPickups() {
    try {
        const response = await fetch('/api/admin/pickups', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        if (!response.ok) throw new Error('Failed to fetch pickups');

        const pickups = await response.json();
        originalPickupData = pickups;
        displayPickups(pickups);
    } catch (error) {
        console.error('Error fetching pickups:', error.message);
    }
}

// Render pickups
function displayPickups(data) {
    pickupList.innerHTML = data.length ? '' : '<tr><td colspan="4" class="text-center p-4">No pickups found</td></tr>';

    data.forEach(({ BorrowedBookID, Title, Username, BorrowDate }) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="p-4 border">${Title}</td>
            <td class="p-4 border">${Username || 'N/A'}</td>
            <td class="p-4 border">${new Date(BorrowDate).toLocaleDateString()}</td>
            <td class="p-4 border">
                <button class="btn-success" onclick="confirmPickup('${BorrowedBookID}')">Confirm</button>
            </td>
        `;
        pickupList.appendChild(row);
    });
}
// Confirm pickup
async function confirmPickup(pickupId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found. Please log in again.');

        const response = await fetch(`/api/admin/confirm-pickup/${pickupId}`, {
            method: 'PUT',
            headers: { Authorization: `Bearer ${token}` },
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to confirm pickup');

        alert('Pickup confirmed successfully!');
        fetchPickups();
    } catch (error) {
        console.error('Error confirming pickup:', error.message);
        alert(`Failed to confirm pickup: ${error.message}`);
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

    const filtered = originalPickupData.filter(({ borrowDate }) => {
        const date = new Date(borrowDate);
        return date >= startDate && date <= endDate;
    });

    displayPickups(filtered);
}

// Reset filter
function resetFilter() {
    startDateInput.value = '';
    endDateInput.value = '';
    displayPickups(originalPickupData);
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    alert('You have logged out.');
    window.location.href = '/statics/signin/index.html';
}
