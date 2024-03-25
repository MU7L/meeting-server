import { Router } from 'express';
import { body, matchedData, param } from 'express-validator';

import tokenController from '../controller/token';
import jwtMiddleware from '../middleware/jwt';
import validationMiddleware from '../middleware/validation';
import logger from '../utils/logger';
import prisma from '../utils/prisma';

const router = Router();

// 注册
router.post(
    '/',
    body('name').notEmpty().withMessage('用户名不能为空'),
    body('email')
        .notEmpty()
        .withMessage('邮箱不能为空')
        .isEmail()
        .withMessage('邮箱格式不正确')
        .custom(email => {
            prisma.user
                .findUnique({
                    where: { email },
                })
                .then(user => {
                    if (user) {
                        throw new Error('该邮箱已注册');
                    }
                })
                .catch(err => {
                    throw err;
                });
        }),
    body('password').notEmpty().withMessage('密码不能为空'),
    validationMiddleware,
    async (req, res) => {
        const { name, email, password } = matchedData(req);
        const user = await prisma.user.create({
            data: { name, email, password },
        });
        logger.info(`用户 ${user.name} 注册成功`);

        // 生成 token
        return res.status(201).send({
            id: user.id,
            ...tokenController.sign(user.id),
        });
    }
);

// 获取用户信息
router.get(
    '/:id',
    jwtMiddleware,
    param('id')
        .notEmpty()
        .withMessage('用户 ID 不能为空')
        .isInt()
        .withMessage('用户 ID 必须为整数'),
    validationMiddleware,
    async (req, res) => {
        const { id } = matchedData(req);
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                // TODO
            },
        });
        return res.send(user);
    }
);

export default router;
