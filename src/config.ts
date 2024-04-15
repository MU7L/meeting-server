import dotenv from 'dotenv';

dotenv.config();

// 运行环境
export const ENV = process.env.NODE_ENV || 'development';

// 服务端口
export const API_PORT = Number(process.env.API_PORT) || 3000;
export const WEB_PORT = Number(process.env.WEB_HOST) || 5173;

// 数据库
export const DB_URL =
    `mongodb://localhost:${process.env.DB_PORT}/${process.env.DB_DATABASE}` ||
    'mongodb://localhost:27017/test';

// jwt
export const JWT_SECRET = process.env.JWT_SECRET || '123456';

// bcrypt
export const BCRYPT_SALT = 10;
