import { Router } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import { body, matchedData, param, query } from 'express-validator';

import jwtHandler from '../middleware/jwt';
import validationHandler from '../middleware/validator';
import teamService from '../service/team';
import CustomError from '../utils/error';

const router = Router();

// 创建团队
router.post(
    '/',
    jwtHandler,
    body('name').isString().notEmpty().withMessage('课题组名称不能为空'),
    body('description').optional().isString(),
    validationHandler,
    (req: JWTRequest, res, next) => {
        if (!req.auth) {
            next(new CustomError('用户无权限', 401));
            return;
        }
        const { id } = req.auth;
        const { name, description } = matchedData(req);
        teamService
            .create({
                name,
                description,
                mentorId: id,
            })
            .then(() => {
                res.send({
                    success: true,
                    message: '创建成功',
                });
            })
            .catch(next);
    },
);

// 查找团队
router.get(
    '/',
    jwtHandler,
    query('tid').optional().isMongoId().withMessage('团队ID格式错误'),
    query('name').optional().isString().withMessage('团队名称格式错误'),
    query('mentorName').optional().isString().withMessage('导师名称格式错误'),
    query('mentorEmail').optional().isString().withMessage('导师邮箱格式错误'),
    validationHandler,
    (req: JWTRequest, res, next) => {
        if (!req.auth) {
            next(new CustomError('用户无权限', 401));
            return;
        }
        const { tid, name, mentorName, mentorEmail } = matchedData(req);
        teamService
            .find({
                tid,
                name,
                mentorName,
                mentorEmail,
            })
            .then(data => {
                res.send({
                    success: true,
                    data,
                });
            })
            .catch(err => {
                next(err);
            });
    },
);

// 请求加入课题组
router.post(
    '/:tid/join',
    jwtHandler,
    param('tid').isMongoId().withMessage('团队ID格式错误'),
    validationHandler,
    (req: JWTRequest, res, next) => {
        if (!req.auth) {
            next(new CustomError('用户无权限', 401));
            return;
        }
        const { id } = req.auth;
        const { tid } = matchedData(req);
        teamService
            .join(tid, id)
            .then(() => {
                res.send({
                    success: true,
                    message: '已向导师发送请求',
                });
            })
            .catch(next);
    },
);

// 将用户加入课题组
router.post(
    '/:tid/members',
    jwtHandler,
    param('tid').isMongoId().withMessage('团队ID格式错误'),
    body('uid').isMongoId().withMessage('用户ID格式错误'),
    validationHandler,
    (req: JWTRequest, res, next) => {
        if (!req.auth) throw new Error('用户无权限', { cause: 401 });
        const { tid, uid } = matchedData(req);
        teamService
            .addMember(tid, uid)
            .then(() => {
                res.send({
                    success: true,
                    message: '已加入课题组',
                });
            })
            .catch(next);
    },
);

// 解散课题组
router.delete(
    '/:tid',
    jwtHandler,
    param('tid').isMongoId().withMessage('团队ID格式错误'),
    validationHandler,
    (req: JWTRequest, res, next) => {
        if (!req.auth) throw new Error('用户无权限', { cause: 401 });
        const uid = req.auth.id;
        const { tid } = matchedData(req);
        teamService
            .delete(tid, uid)
            .then(() => {
                res.send({
                    success: true,
                    message: '课题组已解散',
                });
            })
            .catch(next);
    },
);

// 踢出成员
router.delete(
    '/:tid/members/:uid',
    jwtHandler,
    param('tid').isMongoId().withMessage('团队ID格式错误'),
    param('uid').isMongoId().withMessage('用户ID格式错误'),
    validationHandler,
    (req: JWTRequest, res, next) => {
        if (!req.auth) throw new Error('用户无权限', { cause: 401 });
        const opId = req.auth.id;
        const { tid, uid } = matchedData(req);
        teamService
            .removeMember(tid, uid, opId)
            .then(() => {
                res.send({
                    success: true,
                    message: uid === opId ? '已退出课题组' : '已踢出成员',
                });
            })
            .catch(next);
    },
);

export default router;
