import dotenv from 'dotenv';

dotenv.config();

/** 运行环境 */
export const ENV = process.env.NODE_ENV || 'development';

/** 服务端口 */
export const API_PORT = Number(process.env.API_PORT) || 3000;
export const WEB_PORT = Number(process.env.WEB_HOST) || 5173;

// jwt
export const secret = process.env.JWT_SECRET || '123456';

// 验证码过期时间 ms
export const captchaExpireTime = 10 * 60 * 1000;
