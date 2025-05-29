const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const {
  addBook,
  getBooks,
  deleteBook,
  getPendingPickups,
  confirmPickup,
  getPendingReturns,
  confirmReturn
} = require('../services/bookService');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');

const upload = multer();
const router = express.Router();

const supabaseUrl = 'https://qvkbbgqecszayaeybgok.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2a2JiZ3FlY3N6YXlhZXliZ29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMTI4NDMsImV4cCI6MjA2MzY4ODg0M30.GFTAEj76LBS7ahl6qrxIAxjIG7hVaho4f8X395flc3A';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

router.get('/books', verifyToken, isAdmin, async (req, res) => {
  try {
    const books = await getBooks();
    res.status(200).json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Failed to fetch books', error });
  }
});

router.post('/books', verifyToken, isAdmin, upload.single('image'), async (req, res) => {
  const { title, author, genre, year } = req.body;
  const file = req.file;

  if (!title || !author || !file) {
    return res.status(400).json({ message: 'Title, author, and image are required.' });
  }

  try {
    console.log('🚀 Upload called');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Bucket name:', 'image');
    console.log('Filename:', file.originalname);
    console.log('File mimetype:', file.mimetype);
    console.log('Has buffer:', !!file.buffer);
    const fileName = `${Date.now()}-${file.originalname}`;
    const { error: storageError } = await supabase.storage.from('image').upload(fileName, file.buffer, { upsert: true });

    if (storageError) {
      console.error('Error uploading image to Supabase:', storageError);
      return res.status(500).json({ message: 'Failed to upload image', error: storageError });
    }

    const coverImageUrl = supabase.storage.from('image').getPublicUrl(fileName).data.publicUrl;
    const newBook = { title, author, genre, year, coverImageUrl, addedAt: new Date() };
    const result = await addBook(newBook);

    res.status(201).json({ message: 'Book added successfully.', bookId: result });
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ message: 'Failed to add book', error });
  }
});

router.delete('/books/:id', verifyToken, isAdmin, async (req, res) => {
  const bookId = parseInt(req.params.id);

  try {
    const deleted = await deleteBook(bookId);
    if (!deleted) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(200).json({ message: 'Book deleted successfully.' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Failed to delete book', error });
  }
});

router.get('/pickups', verifyToken, isAdmin, async (req, res) => {
  try {
    const pickups = await getPendingPickups();
    res.status(200).json(pickups);
  } catch (error) {
    console.error('Error fetching book pickups:', error.message);
    res.status(500).json({ message: 'Failed to fetch book pickups' });
  }
});

router.put('/confirm-pickup/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await confirmPickup(id);
    if (!result) {
      return res.status(404).json({ message: 'Book not found or already picked up' });
    }
    res.status(200).json({ message: 'Book pickup confirmed successfully' });
  } catch (error) {
    console.error('Error confirming book pickup:', error.message);
    res.status(500).json({ message: 'Failed to confirm book pickup' });
  }
});

router.get('/returns', verifyToken, isAdmin, async (req, res) => {
  try {
    const returns = await getPendingReturns();
    res.status(200).json(returns);
  } catch (error) {
    console.error('Error fetching book returns:', error.message);
    res.status(500).json({ message: 'Failed to fetch book returns' });
  }
});

router.put('/confirm-return/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await confirmReturn(id);
    if (!result) {
      return res.status(404).json({ message: 'Book not found or already returned' });
    }
    res.status(200).json({ message: 'Book return confirmed successfully' });
  } catch (error) {
    console.error('Error confirming book return:', error.message);
    res.status(500).json({ message: 'Failed to confirm book return' });
  }
});

module.exports = router;