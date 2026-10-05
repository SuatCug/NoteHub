const asyncHandler = require('../utils/asyncHandler');
const { ContactMessage } = require('../models');

const sendContactMessage = asyncHandler(async (req, res) => {
  const { name, email, topic, message } = req.body;
  await ContactMessage.create({ name, email, topic, message, user: req.user?.id });

  res.status(201).json({ success: true, message: 'Thanks! Your message has been received.' });
});

module.exports = { sendContactMessage };
