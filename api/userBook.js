const express = require('express');
const {
  getBooks,
  borrowBook,
  getBorrowedBooks,
  extendBookReturnDate,
  markBookAsLost
} = require('../services/bookService');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Endpoint lấy danh sách sách
router.get('', async (req, res) => {
  const { param } = req.query;
  try {
    const books = await getBooks(param);
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Error fetching books from database' });
  }
});

// Endpoint mượn sách
router.post('/borrow', verifyToken, async (req, res) => {
  try {
    const { bookId, pickupDate, returnDate } = req.body;
    const userId = req.user.UserId;
    console.log('Borrowing book - userId:', userId, 'bookId:', bookId, 'pickupDate:', pickupDate, 'returnDate:', returnDate);
    await borrowBook(userId, parseInt(bookId), pickupDate, returnDate);
    res.status(201).json({ message: 'Book borrowed successfully' });
  } catch (error) {
    console.error('Error borrowing book:', error);
    res.status(500).json({ message: 'Failed to borrow book', error: error.message });
  }
});

// Endpoint xem danh sách sách đã mượn
router.get('/borrowed', verifyToken, async (req, res) => {
  try {
    const userId = req.user.UserId;
    const books = await getBorrowedBooks(userId);
    res.json(books);
  } catch (error) {
    console.error('Error fetching borrowed books:', error.message);
    res.status(500).json({ message: 'Failed to fetch borrowed books', error: error.message });
  }
});

// Endpoint gia hạn sách
router.put('/extend/:borrowedBookId', verifyToken, async (req, res) => {
  try {
    const borrowedBookId = parseInt(req.params.borrowedBookId);
    const { newReturnDate } = req.body;
    const userId = req.user.UserId;
    await extendBookReturnDate(userId, borrowedBookId, newReturnDate);
    res.status(200).json({ message: 'Return date extended successfully.' });
  } catch (error) {
    console.error('Error extending book return date:', error.message);
    res.status(500).json({ message: 'Failed to extend return date', error: error.message });
  }
});

// Endpoint đánh dấu sách mất
router.put('/lost/:borrowedBookId', verifyToken, async (req, res) => {
  try {
    const borrowedBookId = parseInt(req.params.borrowedBookId);
    const userId = req.user.UserId;
    await markBookAsLost(userId, borrowedBookId);
    res.status(200).json({ message: 'Book marked as lost successfully.' });
  } catch (error) {
    console.error('Error marking book as lost:', error.message);
    res.status(500).json({ message: 'Failed to mark book as lost', error: error.message });
  }
});

module.exports = router;