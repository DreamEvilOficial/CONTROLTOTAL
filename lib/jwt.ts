import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key-change-it';
const key = new TextEncoder().encode(SECRET_KEY);

export interface JWTPayload {
  id: string;
  username: string;
  role: 'ADMIN' | 'AGENT' | 'PLAYER';
  [key: string]: any;
}

export async function signJWT(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key);
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}
