import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { sign, verify } from 'jsonwebtoken';

// JWT_SECRET is optional: when it is not set, a secret is derived from
// DATABASE_URL (which is itself secret), so no extra env var is required.
const jwtSecret = (): string => {
    if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
    if (!process.env.DATABASE_URL) throw new Error('JWT_SECRET or DATABASE_URL must be set');
    return createHash('sha256').update('placement-jwt:' + process.env.DATABASE_URL).digest('hex');
};

export const issueToken = async (user: IUser | User) => {
    const { USN, role, version } = user;
    const token = sign({ USN, role, version }, jwtSecret(), {
        algorithm: 'HS256',
        expiresIn: 60 * 60 * 24 * 7,
    });
    return `Bearer ${token}`;
};

export const verifyToken = async (token: string): Promise<User | null> => {
    if (!token) return null;

    const [scheme, value] = token.split(' ');
    if (scheme !== 'Bearer' || !value) return null;

    try {
        return verify(value, jwtSecret(), { algorithms: ['HS256'] }) as User;
    } catch {
        return null;
    }
};

export const encryptPassword = async (password: string) =>
    bcrypt.hash(password, 10);

export const comparePassword = async (
    password: string,
    encrypted_password: string
) => bcrypt.compare(password, encrypted_password);
