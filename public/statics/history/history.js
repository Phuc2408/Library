const borrowedBooksContainer = document.getElementById('borrowedBooks');
const extendPopup = document.getElementById('extendPopup');
const lostPopup = document.getElementById('lostPopup');

// Fetch borrowed books
async function fetchBorrowedBooks() {
    try {
        const response = await fetch('/api/user-books/borrowed', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch borrowed books');
        }

        const borrowedBooks = await response.json();
        displayBorrowedBooks(borrowedBooks);
    } catch (error) {
        console.error('Error fetching borrowed books:', error);
        borrowedBooksContainer.innerHTML = `<p class="text-red-500">Failed to load borrowed books.</p>`;
    }
}

// Display borrowed books
function displayBorrowedBooks(borrowedBooks) {
    borrowedBooksContainer.innerHTML = '';

    if (borrowedBooks.length === 0) {
        borrowedBooksContainer.innerHTML = `<p class="text-gray-500">No borrowed books found.</p>`;
        return;
    }

    borrowedBooks.forEach(book => {
        const statusClass = getStatusClass(book.Status);
        const bookElement = document.createElement('div');
        bookElement.className = 'p-4 border rounded mb-4 bg-white shadow-md';

        bookElement.innerHTML = `
    <h3 class="text-lg font-semibold">${book.Title}</h3>
    <p>Borrow Date: ${new Date(book.BorrowDate).toLocaleDateString()}</p>
    <p>Return Date: ${new Date(book.ReturnDate).toLocaleDateString()}</p>
    <p>Status: <span class="${statusClass} font-bold">${book.Status}</span></p>
    <div class="flex justify-end space-x-4 mt-4">
        <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onclick="openExtendPopup('${book.BorrowedBookID}', '${book.ReturnDate}')">Extend</button>
        <button class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onclick="openLostPopup('${book.BorrowedBookID}')">Lost</button>
    </div>
`;
        borrowedBooksContainer.appendChild(bookElement);
    });
}

function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'borrowed': return 'text-green-500';
        case 'picked-up':
        case 'returned': return 'text-yellow-500';
        case 'overdue':
        case 'lost': return 'text-red-500';
        default: return 'text-gray-500';
    }
}

let currentBorrowedBookId = null;

function openExtendPopup(borrowedBookId, currentReturnDate) {
    if (extendPopup) {
        extendPopup.classList.remove('hidden');
        document.getElementById('newReturnDate').value = currentReturnDate;
        document.getElementById('confirmExtend').setAttribute('onclick', `extendBook('${borrowedBookId}')`);
    }
}

function closeExtendPopup() {
    if (extendPopup) {
        extendPopup.classList.add('hidden');
    }
}

function openLostPopup(borrowedBookId) {
    currentBorrowedBookId = borrowedBookId;
    if (lostPopup) {
        lostPopup.classList.remove('hidden');
    }
}

function closeLostPopup() {
    if (lostPopup) {
        lostPopup.classList.add('hidden');
    }
}

async function extendBook(borrowedBookId) {
    const newReturnDate = document.getElementById('newReturnDate').value;

    try {
        const response = await fetch(`/api/user-books/extend/${borrowedBookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ newReturnDate }),
        });

        if (!response.ok) {
            throw new Error('Failed to extend book.');
        }

        alert('Book return date extended successfully!');
        closeExtendPopup();
        fetchBorrowedBooks();
    } catch (error) {
        console.error('Error extending book:', error);
        alert('Failed to extend book. Please try again.');
    }
}

async function markLost() {
    try {
        const response = await fetch(`/api/user-books/lost/${currentBorrowedBookId}`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to mark book as lost.');
        }

        alert('Book marked as lost successfully!');
        closeLostPopup();
        fetchBorrowedBooks();
    } catch (error) {
        console.error('Error marking book as lost:', error);
        alert('Failed to mark book as lost. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', fetchBorrowedBooks);
