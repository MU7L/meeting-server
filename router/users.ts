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
    validationErrorMiddleware,
    async (req, res) => {
        const { name, email, password } = matchedData(req);
        try {
            const data = await userService.register(name, email, password);
            return res.status(201).send({
                success: true,
                data,
            });
        } catch (err) {
            return res.status(500).send({
                success: false,
                message: err,
            });
        }
    },
);

export default router;
