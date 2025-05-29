const bcrypt = require('bcrypt');
const sql = require('mssql');
const { getConnection } = require('../config/db');

// Tìm user theo email hoặc username
async function findUserByEmailOrUsername(email, username) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('email', sql.NVarChar, email)
        .input('username', sql.NVarChar, username)
        .query('SELECT TOP 1 * FROM Users WHERE Email = @email OR Username = @username');
    return result.recordset[0];
}

async function getUserByUsername(username) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('username', sql.NVarChar, username)
        .query('SELECT TOP 1 * FROM Users WHERE Username = @username');
    return result.recordset[0];
}

// Tạo user mới
async function createUser(email, username, password, name, customId, phone, gender, role = 'user', isBanned = false) {
    const pool = await getConnection();
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.request()
        .input('email', sql.NVarChar, email)
        .input('username', sql.NVarChar, username)
        .input('passwordHash', sql.NVarChar, hashedPassword)
        .input('name', sql.NVarChar, name)
        .input('customId', sql.NVarChar, customId)
        .input('phone', sql.NVarChar, phone)
        .input('gender', sql.NVarChar, gender)
        .input('role', sql.NVarChar, role)
        .input('isBanned', sql.Bit, isBanned)
        .query(`
            INSERT INTO Users (Email, Username, PasswordHash, Name, CustomId, Phone, Gender, Role, IsBanned)
            OUTPUT INSERTED.*
            VALUES (@email, @username, @passwordHash, @name, @customId, @phone, @gender, @role, @isBanned)
        `);

    return result.recordset[0];
}

// So sánh password
async function checkPassword(inputPassword, storedPassword) {
    return await bcrypt.compare(inputPassword, storedPassword);
}

// Lấy toàn bộ user
async function getAllUsers() {
    const pool = await getConnection();
    const result = await pool.request().query('SELECT * FROM Users');
    return result.recordset;
}

// Đổi sql.NVarChar => sql.Int
async function getUserById(userId) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('userId', sql.Int, userId) 
        .query('SELECT TOP 1 * FROM Users WHERE UserId = @userId');
    return result.recordset[0];
}
async function updatePasswordById(userId, newHashedPassword) {
    const pool = await getConnection();
    await pool.request()
        .input('userId', sql.Int, userId)
        .input('passwordHash', sql.NVarChar, newHashedPassword)
        .query('UPDATE Users SET PasswordHash = @passwordHash WHERE UserId = @userId');
}
async function updateUserNameAndPhone(userId, name, phone) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('userId', sql.Int, userId)
        .input('name', sql.NVarChar(100), name)
        .input('phone', sql.NVarChar(20), phone)
        .query(`
            UPDATE Users
            SET Name = @name,
                Phone = @phone
            WHERE UserId = @userId
        `);

    return result.rowsAffected[0] > 0; 
}
async function deleteUserById(userId) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query('DELETE FROM Users WHERE UserId = @userId');

    return result.rowsAffected[0] > 0; 
}
async function updateUserBanStatus(userId, isBanned) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('userId', sql.Int, userId)
        .input('isBanned', sql.Bit, isBanned)
        .query('UPDATE Users SET IsBanned = @isBanned WHERE UserId = @userId');

    return result.rowsAffected[0] > 0;
}
module.exports = { findUserByEmailOrUsername, createUser, checkPassword, getAllUsers, getUserByUsername, getUserById, updatePasswordById, updateUserNameAndPhone, deleteUserById, updateUserBanStatus };