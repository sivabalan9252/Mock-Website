const jwt = require('jsonwebtoken');

module.exports = (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { user_id, email } = req.body;

  if (!user_id && !email) {
    return res.status(400).json({ error: 'user_id or email is required' });
  }

  const secret = process.env.INTERCOM_SECRET_KEY;
  if (!secret) {
    console.error('INTERCOM_SECRET_KEY is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const payload = {};
    if (user_id) payload.user_id = user_id;
    if (email) payload.email = email;

    const token = jwt.sign(payload, secret, { expiresIn: '1h' });

    return res.status(200).json({ token });
  } catch (error) {
    console.error('JWT generation error:', error);
    return res.status(500).json({ error: 'Failed to generate token' });
  }
};
