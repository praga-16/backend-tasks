const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing auth token' });
  const token = h.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // contains at least user_id and email
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid/expired token' });
  }
}

module.exports = { requireAuth };
