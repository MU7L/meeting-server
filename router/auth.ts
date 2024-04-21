// api/auth

import { Router } from 'express';
import { body, matchedData } from 'express-validator';

import validationErrorMiddleware from '../middleware/validator';
import userService from '../service/user';

const router = Router();

// 账号密码登录
router.post(
    '/login',
    body('email')
        .notEmpty()
        .withMessage('邮箱不能为空')
        .isEmail()
        .withMessage('邮箱格式错误'),
    body('password').notEmpty().withMessage('密码不能为空'),
    validationErrorMiddleware,
    async (req, res) => {
        const { email, password } = matchedData(req);
        try {
            const data = await userService.login(email, password);
            res.status(200).send({
                success: true,
                data,
            });
        } catch (error) {
            throw error;
        }
    },
);

export default router;
