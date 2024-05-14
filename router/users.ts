import { Router } from 'express';
import { body, matchedData, param, query } from 'express-validator';

import jwtHandler from '../middleware/jwt';
import validationHandler from '../middleware/validator';
import userService from '../service/user';

const router = Router();

// 登录
router.post(
    '/login',
    body('email')
        .notEmpty()
        .withMessage('邮箱不能为空')
        .isEmail()
        .withMessage('邮箱格式错误'),
    body('password').notEmpty().withMessage('密码不能为空'),
    validationHandler,
    (req, res, next) => {
        const { email, password } = matchedData(req);
        userService
            .login({ email, password })
            .then(data => {
                res.send({
                    success: true,
                    data,
                });
            })
            .catch(next);
    },
);

// 注册
router.post(
    '/',
    body('name').notEmpty().withMessage('用户名不能为空'),
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
    body('avatar').optional(),
    validationHandler,
    (req, res, next) => {
        const { name, email, password, avatar } = matchedData(req);
        userService
            .register({
                name,
                email,
                password,
                avatar,
            })
            .then(data => {
                res.status(201).send({
                    success: true,
                    data,
                });
            })
            .catch(next);
    },
);

// [ ] 查找用户
router.get(
    '/',
    jwtHandler,
    body('name').optional().isString().withMessage('用户名格式错误'),
    body('email').optional().isEmail().withMessage('邮箱格式错误'),
    validationHandler,
    async (req, res) => {
        const { name, email } = matchedData(req);
        if (!name && !email) {
            throw new Error('至少需要一个查询条件', { cause: 400 });
        }
        try {
            const data = await userService.find({ name, email });
            res.status(200).send({
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
    '/:uid',
    jwtHandler,
    param('uid').isMongoId().withMessage('用户ID格式错误'),
    (req, res, next) => {
        const { uid } = matchedData(req);
        userService
            .getUser(uid)
            .then(data => {
                res.send({
                    success: true,
                    data,
                });
            })
            .catch(next);
    },
);

// 获取用户所在所有团队信息
router.get(
    '/:uid/teams',
    jwtHandler,
    param('uid').isMongoId().withMessage('用户ID格式错误'),
    validationHandler,
    (req, res, next) => {
        const { uid } = matchedData(req);
        userService
            .getTeams(uid)
            .then(data => {
                res.send({
                    success: true,
                    data,
                });
            })
            .catch(next);
    },
);

router.get(
    '/:uid/meetings',
    jwtHandler,
    param('uid').isMongoId().withMessage('用户ID格式错误'),
    query('from').isISO8601().withMessage('开始时间格式错误').toDate(),
    query('to').isISO8601().withMessage('结束时间格式错误').toDate(),
    validationHandler,
    (req, res, next) => {
        const { uid, from, to } = matchedData(req);
        userService
            .getMeetings(uid, from, to)
            .then(data => {
                res.send({
                    success: true,
                    data,
                });
            })
            .catch(next);
    },
);

export default router;
