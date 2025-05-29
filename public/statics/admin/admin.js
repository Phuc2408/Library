document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user?.role;

    if (!token || role !== 'admin') {
        alert('Access denied. Redirecting to login page.');
        window.location.href = '../signin/index.html';
        return;
    }

    const addBookModal = document.getElementById('addBookModal');
    const addBookForm = document.getElementById('addBookForm');
    const bookTableBody = document.getElementById('bookTable').querySelector('tbody');

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.clear();
        alert('Logged out successfully.');
        window.location.href = '../signin/index.html';
    });

    document.getElementById('addBookBtn').addEventListener('click', () => {
        addBookModal.classList.remove('hidden');
    });

    window.closeAddBookModal = () => {
        addBookModal.classList.add('hidden');
    };

    async function fetchBooks() {
        try {
            const response = await fetch('http://localhost:5000/api/admin/books', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to fetch books');
            const books = await response.json();
            renderBooks(books);
        } catch (error) {
            console.error('Error fetching books:', error);
            alert('Failed to load books.');
        }
    }

    function renderBooks(books) {
    bookTableBody.innerHTML = books.map(book => `
        <tr>
            <td class="border px-4 py-2">${book.Title}</td>
            <td class="border px-4 py-2">${book.Author}</td>
            <td class="border px-4 py-2">${book.Genre}</td>
            <td class="border px-4 py-2">${book.Year}</td>
            <td class="border px-4 py-2">
                <button onclick="deleteBook('${book.BookId}')" class="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Delete</button>
            </td>
        </tr>
    `).join('');
}

    addBookForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('bookTitle').value;
        const author = document.getElementById('bookAuthor').value;
        const genre = document.getElementById('bookGenre').value;
        const year = document.getElementById('bookYear').value;
        const file = document.getElementById('bookCover').files[0];

        const formData = new FormData();
        formData.append('title', title);
        formData.append('author', author);
        formData.append('genre', genre);
        formData.append('year', year);
        formData.append('image', file);

        try {
            const response = await fetch('http://localhost:5000/api/admin/books', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to add book');
            }

            closeAddBookModal();
            fetchBooks();
        } catch (error) {
            console.error('Error adding book:', error);
            alert(error.message);
        }
    });

    window.deleteBook = async (bookId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/admin/books/${bookId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) throw new Error('Failed to delete book');
            fetchBooks();
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Failed to delete book.');
        }
    };

    fetchBooks();
});
