const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

// register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'name,email,password required' });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const q = `INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING user_id, name, email, registration_date`;
    const { rows } = await db.query(q, [name, email, hash]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    // unique email
    if (err.code === '23505') return res.status(409).json({ error: 'Email already registered' });
    next(err);
  }
});

// login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email,password required' });
    const { rows } = await db.query('SELECT user_id, email, password_hash, name FROM users WHERE email = $1', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ user_id: user.user_id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '15m' });
    return res.json({ access_token: token, expires_in: 900 });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
