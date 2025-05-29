const sql = require('mssql');
const { getConnection } = require('../config/db');

// Hàm lấy danh sách sách
async function getBooks(param = null) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('searchTerm', sql.NVarChar, `%${param || ''}%`)
            .query("SELECT * FROM Books WHERE Title LIKE @searchTerm");

        return result.recordset;
    } catch (error) {
        console.error("Error fetching books:", error);
        throw error;
    }
}

// Hàm thêm sách
async function addBook(book) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('title', sql.NVarChar, book.title)
            .input('author', sql.NVarChar, book.author)
            .input('genre', sql.NVarChar, book.genre)
            .input('year', sql.Int, book.year)
            .input('coverImageUrl', sql.NVarChar, book.coverImageUrl)
            .query("INSERT INTO Books (Title, Author, Genre, Year, CoverImageUrl) VALUES (@title, @author, @genre, @year, @coverImageUrl)");

        return result;
    } catch (error) {
        console.error("Error adding book:", error);
        throw error;
    }
}

// Hàm xóa sách
async function deleteBook(bookId) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('bookId', sql.Int, bookId)
            .query("DELETE FROM Books WHERE BookID = @bookId");

        return result;
    } catch (error) {
        console.error("Error deleting book:", error);
        throw error;
    }
}

// Mượn sách
async function borrowBook(userId, bookId, pickupDate, returnDate) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('bookId', sql.Int, bookId)
            .input('borrowDate', sql.Date, pickupDate)
            .input('returnDate', sql.Date, returnDate)
            .input('status', sql.NVarChar, 'borrowed')
            .query(`INSERT INTO BorrowedBooks (UserId, BookId, BorrowDate, ReturnDate, Status)
                    VALUES (@userId, @bookId, @borrowDate, @returnDate, @status)`);
        return result;
    } catch (error) {
        console.error('Error borrowing book:', error);
        throw error;
    }
}
async function getPendingPickups() {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`SELECT bb.BorrowedBookID, u.Username, b.Title, bb.BorrowDate, bb.ReturnDate
                    FROM BorrowedBooks bb
                    JOIN Users u ON bb.UserId = u.UserID
                    JOIN Books b ON bb.BookId = b.BookID
                    WHERE bb.Status = 'borrowed'`);
        return result.recordset;
    } catch (error) {
        console.error("Error fetching pending pickups:", error);
        throw error;
    }
}
// Lấy sách đã mượn
async function getBorrowedBooks(userId) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(`SELECT 
          b.Title AS Title, 
          bb.BorrowDate, 
          bb.ReturnDate, 
          bb.Status, 
          bb.BorrowedBookID AS BorrowedBookID
        FROM BorrowedBooks bb
        JOIN Books b ON bb.BookId = b.BookID
        WHERE bb.UserId = @userId`);
        return result.recordset;
    } catch (error) {
        console.error('Error fetching borrowed books:', error);
        throw error;
    }
}
async function confirmPickup(borrowedBookId) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('borrowedBookId', sql.Int, borrowedBookId)
            .query(`
                UPDATE BorrowedBooks
                SET Status = 'picked-up'
                WHERE BorrowedBookID = @borrowedBookId AND Status = 'borrowed'
            `);

        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error('Error confirming pickup:', error);
        throw error;
    }
}

// Gia hạn sách
async function extendBookReturnDate(userId, borrowedBookId, newReturnDate) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('borrowedBookId', sql.Int, borrowedBookId)
            .input('newReturnDate', sql.Date, newReturnDate)
            .query(`UPDATE BorrowedBooks
                    SET ReturnDate = @newReturnDate
                    WHERE BorrowedBookID = @borrowedBookId AND UserId = @userId AND Status = 'borrowed'`);

        if (result.rowsAffected[0] === 0) throw new Error("No matching borrowed book to update");
        return result;
    } catch (error) {
        console.error('Error extending return date:', error);
        throw error;
    }
}

// Đánh dấu mất sách
async function markBookAsLost(userId, borrowedBookId) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .input('borrowedBookId', sql.Int, borrowedBookId)
            .query(`UPDATE BorrowedBooks
                    SET Status = 'lost'
                    WHERE BorrowedBookID = @borrowedBookId AND UserId = @userId AND Status = 'borrowed'`);

        if (result.rowsAffected[0] === 0) throw new Error("No matching borrowed book to mark as lost");
        return result;
    } catch (error) {
        console.error('Error marking book as lost:', error);
        throw error;
    }
}
async function getPendingReturns() {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`
                SELECT 
                    bb.BorrowedBookID,
                    u.Username,
                    b.Title,
                    bb.BorrowDate,
                    bb.ReturnDate
                FROM BorrowedBooks bb
                JOIN Users u ON bb.UserId = u.UserID
                JOIN Books b ON bb.BookId = b.BookID
                WHERE bb.Status = 'picked-up'
            `);
        return result.recordset;
    } catch (error) {
        console.error('Error fetching pending returns:', error);
        throw error;
    }
}
async function confirmReturn(borrowedBookId) {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('borrowedBookId', sql.Int, borrowedBookId)
            .query(`
                UPDATE BorrowedBooks
                SET Status = 'returned'
                WHERE BorrowedBookID = @borrowedBookId AND Status = 'picked-up'
            `);

        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error('Error confirming return:', error);
        throw error;
    }
}

module.exports = {
    getBooks,
    addBook,
    deleteBook,
    borrowBook,
    getBorrowedBooks,
    extendBookReturnDate,
    markBookAsLost,
    getPendingPickups,
    confirmPickup,
    getPendingReturns,
    confirmReturn
};
