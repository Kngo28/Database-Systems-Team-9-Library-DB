const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function register(req, res) {
    let body = '';

    // collect incoming request data in chunks, then process once fully received
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            const { first_name, last_name, email, username, password, phone_number, birthday } = JSON.parse(body);

            // hash the password before storing — bcrypt is one-way so the plain text password is never saved. The 10 is "salt rounds" — how many times it hashes. 10 is standard.
            const hashedPassword = await bcrypt.hash(password, 10);

            // insert into Person table role 1 = staff, role 2 = user/patron. account_status 1 = active. borrow_status 1 = allowed to borrow
            const [result] = await db.query(
                `INSERT INTO Person (First_name, Last_name, email, username, password, role, phone_number, birthday, account_status, borrow_status)
                 VALUES (?, ?, ?, ?, ?, 2, ?, ?, 1, 1)`,
                [first_name, last_name, email, username, hashedPassword, phone_number, birthday]
            );

            const personId = result.insertId;

            // also insert into User subtable — User_permissions 1 = standard user for now
            // this may expand later if specific permission levels are added
            await db.query(
                `INSERT INTO User (Person_ID, User_permissions) VALUES (?, 1)`,
                [personId]
            );

            res.writeHead(201);
            res.end(JSON.stringify({ message: 'User registered successfully' }));
        } catch (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Registration failed', details: err.message }));
        }
    });
}

module.exports = { register };
