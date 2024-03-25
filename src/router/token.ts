/// <reference types="../express.d.ts" />

import { Router } from 'express';
import { body, matchedData } from 'express-validator';

import captchaController from '../controller/captcha';
import tokenController from '../controller/token';
import validationMiddleware from '../middleware/validation';
import prisma from '../utils/prisma';

const router = Router();

// 账号密码登录
router.post(
    '/',
    body('email')
        .notEmpty()
        .withMessage('邮箱不能为空')
        .isEmail()
        .withMessage('邮箱格式错误')
        .custom(async (email, { req }) => {
            const user = await prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                    password: true,
                },
            });
            if (!user) throw new Error('用户未注册');
            req.user = user;
        }),
    body('password')
        .notEmpty()
        .withMessage('密码不能为空')
        .custom((password, { req }) => {
            if (req.user.password !== password) {
                throw new Error('密码错误');
            }
        }),
    validationMiddleware,
    (req, res) => {
        const user = req.user;
        if (!user) {
            return res.status(400).send({
                message: '用户未注册',
            });
        }
        // 返回 token
        return res.send({
            id: user.id,
            ...tokenController.sign(user.id),
        });
    }
);

// 发送验证码
router.post(
    '/captcha',
    body('email')
        .notEmpty()
        .withMessage('邮箱不能为空')
        .isEmail()
        .withMessage('邮箱格式错误')
        .custom(async (email, { req }) => {
            const user = await prisma.user.findUnique({
                where: { email },
                select: {
                    id: true,
                },
            });
            if (!user) throw new Error('用户未注册');
            req.user = user;
        }),
    validationMiddleware,
    async (req, res) => {
        const { email } = matchedData(req);
        const user = req.user;
        if (!user) {
            return res.status(400).send({
                message: '用户未注册',
            });
        }

        const captcha = captchaController.generate();
        // TODO: 发送验证码
        captchaController.set(email, user.id, captcha);
        return res.send({
            message: '验证码已发送',
        });
    }
);

// 验证码登录
router.post(
    '/forget',
    body('email')
        .notEmpty()
        .withMessage('邮箱不能为空')
        .isEmail()
        .withMessage('邮箱格式错误')
        .custom(email => {
            if (!captchaController.map.has(email))
                throw new Error('验证码已过期');
        }),
    body('captcha')
        .notEmpty()
        .withMessage('验证码不能为空')
        .isLength({ min: 5, max: 5 })
        .withMessage('验证码格式错误')
        .custom((captcha, { req }) => {
            if (!captchaController.examine(req.body.email, captcha))
                throw new Error('验证码错误');
        }),
    validationMiddleware,
    (req, res) => {
        const user = req.user;
        if (!user) {
            return res.status(400).send({
                message: '用户未注册',
            });
        }

        return res.send({
            id: user.id,
            ...tokenController.sign(user.id),
        });
    }
);

// TODO: 更新 token

export default router;
