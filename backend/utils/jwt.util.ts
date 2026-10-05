import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import type { Types } from 'mongoose';

export interface TokenPayload {
  id: string;
}

const secret = () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set.');
  return process.env.JWT_SECRET;
};

const generateToken = (payload: { id: Types.ObjectId | string }) =>
  jwt.sign(payload, secret(), {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'],
  });

// Geçersiz / süresi dolmuş token'da hata fırlatır.
const verifyToken = (token: string) => jwt.verify(token, secret()) as JwtPayload & TokenPayload;

export { generateToken, verifyToken };
