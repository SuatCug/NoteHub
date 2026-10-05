import bcrypt from 'bcryptjs';
import asyncHandler, { type AuthedRequest } from '../utils/asyncHandler.ts';
import ApiError from '../utils/apiError.ts';
import { generateToken } from '../utils/jwt.util.ts';
import { createVerificationToken, hashToken } from '../utils/token.util.ts';
import { sendVerificationEmail } from '../services/mail.service.ts';
import { User } from '../models/index.ts';
import { requireEmailVerification } from '../config/features.ts';
import type { UserDocument } from '../models/user.model.ts';

const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;

// Kullanıcıya yeni bir doğrulama token'ı atar ve e-postayı gönderir. Gönderim başarısızsa false döner
// (hesap yine de kaydedilir; kullanıcı daha sonra "tekrar gönder" ile yeni bağlantı isteyebilir).
const issueVerification = async (user: UserDocument) => {
  const { token, tokenHash } = createVerificationToken();
  user.verificationTokenHash = tokenHash;
  user.verificationTokenExpires = new Date(Date.now() + VERIFICATION_TTL_MS);
  await user.save();
  try {
    await sendVerificationEmail(user, token);
    return true;
  } catch (error) {
    console.error('Verification email error:', (error as Error).message);
    return false;
  }
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
  let emailSent = true;
  if (verificationRequired) {
    emailSent = await issueVerification(user);
  } else {
    await user.save();
  }

  const token = generateToken({ id: user._id });

  res.status(201).json({
    success: true,
    message: !verificationRequired
      ? 'Registration successful.'
      : emailSent
        ? 'Registration successful. Please verify your account using the link sent to your email.'
        : "Registration successful, but we couldn't send the verification email. Please use 'Resend' in a moment.",
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

const me = asyncHandler<AuthedRequest>(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found.');
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

const resendVerification = asyncHandler<AuthedRequest>(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(404, 'User not found.');
  if (user.hasVerifiedAccess()) {
    throw new ApiError(400, 'Your email address is already verified.');
  }

  if (!(await issueVerification(user))) {
    throw new ApiError(502, 'We could not send the verification email. Please try again in a few minutes.');
  }

  res.json({ success: true, message: 'Verification email sent again.' });
});

export { register, login, me, verifyEmail, resendVerification };
