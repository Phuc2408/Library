// Biến toàn cục để lưu dữ liệu sách và bookId hiện tại
let booksData = [];
let currentBookId = null;

// Lấy các phần tử DOM
const search = document.getElementById('search');
const suggestions = document.getElementById('suggestions');
const bookDetailsModal = document.getElementById('bookDetailsModal');
const borrowModal = document.getElementById('borrowModal');
const bookGrid = document.getElementById('book-grid');
const genreFilter = document.getElementById('genreFilter');
const pickupDateInput = document.getElementById('pickupDate');
const returnDateInput = document.getElementById('returnDate');

function logOut() {
  localStorage.clear();
}

function showBookDetails(bookId) {
  const book = booksData.find(book => book.Id == bookId);
  if (!book) return;

  const detailsHTML = `
    <div class="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6 p-4">
      <div class="w-48 h-64 overflow-hidden rounded-md flex justify-center items-center bg-gray-100">
          <img src="${book.CoverImageUrl}" alt="${book.Title} cover" class="max-w-full max-h-full object-contain"/>
      </div>
      <div class="space-y-3 flex-1">
          <h3 class="text-2xl font-semibold text-gray-800">${book.Title}</h3>
          <p class="text-lg text-gray-600">by ${book.Author}</p>
          <p class="text-sm text-gray-500">Publish Year: ${book.Year}</p>
          <p class="text-sm text-gray-500">Genre: ${book.Genre}</p>
      </div>
    </div>
    <div class="flex justify-end space-x-4 mt-4">
        <button onclick="closeBookDetailsModal()" class="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400">Close</button>
        <button onclick="showBorrowModal('${book.Id}')" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Borrow</button>
    </div>`;

  document.getElementById('bookDetails').innerHTML = detailsHTML;
  bookDetailsModal.classList.remove('hidden');
}

function closeBookDetailsModal() {
  bookDetailsModal.classList.add('hidden');
}

function showBorrowModal(bookId) {
  if (!bookId || isNaN(bookId)) return;
  currentBookId = bookId;
  const today = new Date();
  pickupDateInput.valueAsDate = today;
  const returnDate = new Date();
  returnDate.setDate(today.getDate() + 30);
  returnDateInput.valueAsDate = returnDate;
  borrowModal.classList.remove('hidden');
}

function closeBorrowModal() {
  borrowModal.classList.add('hidden');
}

pickupDateInput.addEventListener('change', function () {
  const selectedDate = new Date(this.value);
  const returnDate = new Date(selectedDate);
  returnDate.setDate(selectedDate.getDate() + 30);
  returnDateInput.valueAsDate = returnDate;
});

async function loadBooks(search = null) {
  try {
    const response = await fetch(`/api/user-books${search ? `?param=${search}` : ''}`);
    const rawBooks = await response.json();

    booksData = rawBooks.map(book => {
      const id = book.BookId ?? book.BookID ?? book.id;
      return { ...book, Id: id };
    });

    bookGrid.innerHTML = '';
    booksData.forEach(book => {
      bookGrid.appendChild(createBookElement(book));
    });
  } catch (error) {
    // Silent fail
  }
}

function createBookElement(book) {
  const bookElement = document.createElement('div');
  bookElement.className = 'bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition-transform duration-300 hover:scale-105 focus-within:ring-2 focus-within:ring-blue-400';

  bookElement.innerHTML = `
    <div class="w-full h-48 flex justify-center items-center bg-gray-100">
        <img src="${book.CoverImageUrl}" alt="${book.Title}" class="max-w-full max-h-full object-contain rounded-sm">
    </div>
    <div class="p-4">
        <h3 class="text-lg font-semibold text-gray-800 truncate">${book.Title}</h3>
        <p class="text-gray-600 text-sm mt-1">${book.Author}</p>
        <p class="text-sm text-gray-500 mt-1">${book.Genre}</p>
    </div>`;

  bookElement.addEventListener('click', () => showBookDetails(book.Id));
  return bookElement;
}

document.getElementById('borrowForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const pickupDate = document.getElementById('pickupDate').value;
  const returnDate = document.getElementById('returnDate').value;

  try {
    const response = await fetch('/api/user-books/borrow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        bookId: currentBookId,
        pickupDate,
        returnDate
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to borrow book.');
    }

    alert('Book borrowed successfully!');
    closeBorrowModal();
    loadBooks();
  } catch (error) {
    alert('Failed to borrow book. Please try again.');
  }
});

search.addEventListener('keypress', async (event) => {
  if (event.key === "Enter") {
    const keyword = search.value.trim().toLowerCase();
    loadBooks(keyword);
  }
});

document.addEventListener('DOMContentLoaded', function () {
  loadBooks();
});

genreFilter.addEventListener('change', () => {
  const selectedGenre = genreFilter.value;
  bookGrid.innerHTML = '';
  const filteredBooks = booksData.filter(book => !selectedGenre || book.Genre === selectedGenre);
  filteredBooks.forEach(book => {
    bookGrid.appendChild(createBookElement(book));
  });
});
