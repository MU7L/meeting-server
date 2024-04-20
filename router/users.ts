import { Router } from 'express';
import { body, matchedData, param } from 'express-validator';

import jwtMiddleware from '../middleware/jwt';
import validationHandler from '../middleware/validator';
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
    validationHandler,
    async (req, res) => {
        const { name, email, password } = matchedData(req);
        try {
            const data = await userService.register(name, email, password);
            res.status(201).send({
                success: true,
                data,
            });
        } catch (err) {
            throw err;
        }
    },
);

// 获取用户信息
router.get(
    '/:id',
    jwtMiddleware,
    param('id')
        .isEmpty()
        .withMessage('用户ID不能为空')
        .isMongoId()
        .withMessage('用户ID格式错误'),
    validationHandler,
    async (req, res) => {
        const { id } = matchedData(req);
        try {
            const data = await userService.getUser(id);
            res.status(200).send({
                success: true,
                data,
            });
        } catch (err) {
            throw err;
        }
    },
);

export default router;
