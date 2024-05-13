import dotenv from 'dotenv';

dotenv.config();

// 运行环境
export const ENV = process.env.NODE_ENV || 'development';

// 服务端口
export const API_HOST = process.env.API_HOST || 'localhost';
export const API_PORT = Number(process.env.API_PORT) || 3000;
export const WEB_PORT = Number(process.env.WEB_HOST) || 5173;

// 数据库
const DB_PORT = Number(process.env.DB_PORT) || 27017;
const DB_DATABASE = process.env.DB_DATABASE || 'meeting';
const DB_USERNAME = process.env.DB_USERNAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_URL =
    DB_USERNAME && DB_PASSWORD
        ? `mongodb://${DB_USERNAME}:${DB_PASSWORD}@127.0.0.1:${DB_PORT}/${DB_DATABASE}`
        : `mongodb://127.0.0.1:${DB_PORT}/${DB_DATABASE}`;

// jwt
export const JWT_SECRET = process.env.JWT_SECRET || '123456';

// bcrypt
export const BCRYPT_SALT = 10;
