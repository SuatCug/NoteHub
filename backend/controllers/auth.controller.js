const bcrypt = require('bcryptjs');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { generateToken } = require('../utils/jwt.util');
const { createVerificationToken, hashToken } = require('../utils/token.util');
const { sendVerificationEmail } = require('../services/mail.service');
const { User } = require('../models');
const { requireEmailVerification } = require('../config/features');

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

// Kullanıcıya yeni bir doğrulama token'ı atar ve e-postayı gönderir.
const issueVerification = async (user) => {
  const { token, tokenHash } = createVerificationToken();
  user.verificationTokenHash = tokenHash;
  user.verificationTokenExpires = new Date(Date.now() + VERIFICATION_TTL_MS);
  await user.save();
  await sendVerificationEmail(user, token);
};

const register = asyncHandler(async (req, res) => {
  const { fullName, email, password, university, department } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'This email address is already registered.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({ fullName, email, passwordHash, university, department });

  // Doğrulama kapalıysa kod gönderilmez, hesap doğrudan kullanılabilir.
  const verificationRequired = requireEmailVerification();
  if (verificationRequired) {
    await issueVerification(user);
  } else {
    await user.save();
  }

  const token = generateToken({ id: user._id });

  res.status(201).json({
    success: true,
    message: verificationRequired
      ? 'Registration successful. Please verify your account using the link sent to your email.'
      : 'Registration successful.',
    data: { user: user.toSafeJSON(), token },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) {
    throw new ApiError(401, 'Incorrect email or password.');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new ApiError(401, 'Incorrect email or password.');
  }

  const token = generateToken({ id: user._id });

  res.json({
    success: true,
    message: 'Logged in successfully.',
    data: { user: user.toSafeJSON(), token },
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, data: { user: user.toSafeJSON() } });
});

const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    verificationTokenHash: hashToken(req.body.token),
    verificationTokenExpires: { $gt: new Date() },
  });
  if (!user) {
    throw new ApiError(400, 'The verification link is invalid or has expired.');
  }

  user.isVerified = true;
  user.verificationTokenHash = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Your email address has been verified.', data: { user: user.toSafeJSON() } });
});

const resendVerification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (user.hasVerifiedAccess()) {
    throw new ApiError(400, 'Your email address is already verified.');
  }

  await issueVerification(user);

  res.json({ success: true, message: 'Verification email sent again.' });
});

module.exports = { register, login, me, verifyEmail, resendVerification };
