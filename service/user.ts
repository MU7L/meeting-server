import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { BCRYPT_SALT, JWT_SECRET } from '../config';
import UserModel from '../models/user';
import logger from '../utils/logger';

const userService = {
    /**
     * 登录
     * @param email 邮箱
     * @param encryptedPassword 加密后密码
     * @returns {Promise<{ id: string; token: string }>} 用户id 和 token
     */
    async login(
        email: string,
        encryptedPassword: string,
    ): Promise<{ id: string; token: string }> {
        const userDoc = await UserModel.findOne({ email });
        if (!userDoc) throw new Error('用户未注册');
        await new Promise<void>((resolve, reject) => {
            bcrypt.compare(
                encryptedPassword,
                userDoc.encryptedPassword,
                (err, result) => {
                    if (err) reject(err);
                    if (!result) reject(new Error('密码错误'));
                    resolve();
                },
            );
        });
        const token = jwt.sign(userDoc.id, JWT_SECRET, {
            expiresIn: '1d',
        });
        logger.info(`用户 ${userDoc.name} 登录`);
        return { id: userDoc.id, token };
    },

    /**
     * 注册
     * @param name 用户名
     * @param email 邮箱
     * @param password 密码
     * @returns {Promise<{ id: string; token: string }>} 用户id 和 token
     */
    async register(
        name: string,
        email: string,
        password: string,
    ): Promise<{ id: string; token: string }> {
        let userDoc = await UserModel.findOne({ email });
        if (userDoc) {
            throw new Error('用户已注册', {
                cause: 409,
            });
        }

        const encryptedPassword = await new Promise((resolve, reject) => {
            bcrypt.genSalt(BCRYPT_SALT, (err, salt) => {
                if (err) reject(err);
                bcrypt.hash(password, salt, (err, hash) => {
                    if (err) reject(err);
                    resolve(hash);
                });
            });
        });
        userDoc = new UserModel({ name, email, encryptedPassword });
        await userDoc.save();
        const token = jwt.sign({ id: userDoc.id }, JWT_SECRET, {
            expiresIn: '1d',
        });
        return { id: userDoc.id, token };
    },
};

export default userService;
