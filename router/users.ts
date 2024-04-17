import { Router } from 'express';
import { body, matchedData } from 'express-validator';

import validationErrorMiddleware from '../middleware/validator';
import userService from '../service/user';

const router = Router();

// 注册
router.post(
    '/',
    body('name').notEmpty().withMessage('用户名不能为空').escape(),
    body('email')
        .notEmpty()
        .withMessage('邮箱不能为空')
        .isEmail()
        .withMessage('邮箱格式错误'),
    body('password').notEmpty().withMessage('密码不能为空'),
    body('repeatPassword')
        .notEmpty()
        .withMessage('确认密码不能为空')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('两次密码输入不一致');
            }
            return true;
        }),
    validationErrorMiddleware,
    async (req, res) => {
        const { name, email, password } = matchedData(req);
        try {
            const data = await userService.register(name, email, password);
            res.status(201).send({
                success: true,
                data,
            });
        } catch (err) {
            // TODO: 错误处理复用
            let errorCode = 500;
            let errorMsg = '服务器错误';
            if (err instanceof Error) {
                errorCode = err.cause as number;
                errorMsg = err.message;
            }
            res.status(errorCode).send({
                success: false,
                message: errorMsg,
            });
        }
    },
);

export default router;
