
import * as jwt from 'jsonwebtoken';
import { User } from '../schema';
import { config } from '../config/env';

export function createToken(user: User): string {
  const payload = { 
    id: user.id,
    username: user.username,
    role: user.role 
  };
  const secret = config.JWT_SECRET || 'default-secret-key';
  const options = { expiresIn: config.JWT_EXPIRES_IN || '24h' } as jwt.SignOptions;
  
  return jwt.sign(payload, secret, options);
}

export function verifyToken(token: string) {
  return jwt.verify(token, config.JWT_SECRET || 'default-secret-key') as {
    id: number;
    username: string;
    role: string;
  };
}
