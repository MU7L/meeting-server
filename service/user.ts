import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { BCRYPT_SALT, JWT_SECRET } from '../config';
import { MeetingModel, TeamModel, UserModel } from '../models';
import logger from '../utils/logger';
import { isDocument } from '@typegoose/typegoose';
import CustomError from '../utils/error';

const userService = {
    /** 登录 */
    async login({ email, password }: { email: string; password: string }) {
        const userDoc = await UserModel.findOne({ email })
            .select('avatar name +encryptedPassword')
            .exec();
        if (!userDoc) throw new CustomError('用户未注册', 404);
        if (!userDoc.encryptedPassword) throw new CustomError('账号异常', 401);
        await new Promise<void>((resolve, reject) => {
            bcrypt.compare(
                password,
                userDoc.encryptedPassword,
                (err, result) => {
                    if (err) reject(err);
                    if (!result) reject(new CustomError('密码错误', 401));
                    resolve();
                },
            );
        });
        const token = jwt.sign({ id: userDoc._id }, JWT_SECRET, {
            expiresIn: '1d',
        });
        logger.info(`用户 ${userDoc.name} 登录`);
        return {
            id: userDoc._id,
            token,
        };
    },

    /** 注册 */
    async register({
        name,
        email,
        password,
        avatar,
    }: {
        name: string;
        email: string;
        password: string;
        avatar?: string;
    }) {
        let userDoc = await UserModel.findOne({ email });
        if (userDoc) {
            throw new CustomError('用户已注册', 409);
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
        userDoc = await UserModel.create({
            name,
            email,
            encryptedPassword,
            avatar,
        });
        const token = jwt.sign({ id: userDoc._id }, JWT_SECRET, {
            expiresIn: '1d',
        });
        return {
            id: userDoc._id,
            name,
            avatar,
            token,
        };
    },

    /** 根据name或email查找 */
    async find({ name, email }: Partial<{ name: string; email: string }>) {
        return await UserModel.find({
            $or: [{ name }, { email }],
        })
            .select('name email avatar')
            .exec();
    },

    /** 获取用户信息 */
    async getUser(id: string) {
        const userDoc = await UserModel.findById(id)
            .select('name email avatar')
            .exec();
        if (!userDoc) throw new CustomError('用户不存在', 404);
        return userDoc;
    },

    /** 获取用户所在所有团队信息 */
    async getTeams(uid: string) {
        const userDoc = await UserModel.findById(uid)
            .select('teams')
            .populate({
                path: 'teams',
                populate: [
                    {
                        path: 'mentor',
                        select: '-teams -meetings',
                    },
                    {
                        path: 'members',
                        populate: {
                            path: 'user',
                            select: '-teams -meetings',
                        },
                    },
                ],
            });
        if (!userDoc) throw new CustomError('用户不存在', 404);
        return userDoc.teams;
    },

    /** 获取一个月内的会议 */
    async getMeetings(id: string, from: Date, to: Date) {
        const userDoc = await UserModel.findById(id).select('meetings');
        if (!userDoc) throw new CustomError('用户不存在', 404);
        const meetingDocList = await MeetingModel.find({
            _id: { $in: userDoc.meetings },
            start: { $gte: from, $lte: to },
        })
            .select('title start end')
            .sort('start');
        return meetingDocList;
    },
};

export default userService;
