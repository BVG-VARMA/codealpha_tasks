const jwt = require('jsonwebtoken');

function protect(req, res, next) {
  // Expect header:  Authorization: Bearer <token>
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token – access denied.' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;   // { id, name, email }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid or expired.' });
  }
}

module.exports = { protect };