import { Router } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import { body, matchedData, param, query } from 'express-validator';

import jwtMiddleware from '../middleware/jwt';
import meetingService from '../service/meeting';
import CustomError from '../utils/error';
import validationHandler from '../middleware/validator';
import { AttendeeResponse } from '../models/meeting';

const router = Router();

// 新建
router.post(
    '/',
    jwtMiddleware,
    body('title').optional(),
    body('description').optional(),
    body('start')
        .optional()
        .isISO8601()
        .withMessage('开始时间格式错误')
        .toDate(),
    body('end').optional().isISO8601().withMessage('结束时间格式错误').toDate(),
    body('teams').optional(),
    validationHandler,
    (req: JWTRequest, res, next) => {
        if (!req.auth) {
            next(new CustomError('用户无权限', 401));
            return;
        }
        const sponsorId = req.auth.id;
        const { title, description, start, end, teams } = matchedData(req);
        meetingService
            .create(sponsorId, {
                title,
                description,
                start,
                end,
                teamIdList: teams,
            })
            .then(data => {
                res.send({
                    success: true,
                    message: '预定成功',
                    data,
                });
            })
            .catch(next);
    },
);

// 查询会议详情
router.get(
    '/:mid',
    jwtMiddleware,
    param('mid').isMongoId().withMessage('会议ID格式错误'),
    validationHandler,
    (req: JWTRequest, res, next) => {
        if (!req.auth) {
            next(new CustomError('用户无权限', 401));
            return;
        }
        const uid = req.auth.id;
        const { mid } = matchedData(req);
        meetingService
            .getMeeting(mid, uid)
            .then(data => {
                res.send({
                    success: true,
                    data,
                });
            })
            .catch(next);
    },
);

// 提交会议响应
router.put(
    '/:mid/response',
    jwtMiddleware,
    param('mid').isMongoId().withMessage('会议ID格式错误'),
    body('response')
        .isIn([
            AttendeeResponse.ACCEPTED,
            AttendeeResponse.PENDING,
            AttendeeResponse.REJECTED,
        ])
        .withMessage('响应状态错误'),
    validationHandler,
    (req: JWTRequest, res, next) => {
        if (!req.auth) {
            next(new CustomError('用户无权限', 401));
            return;
        }
        const uid = req.auth.id;
        const { mid, response } = matchedData(req);
        meetingService
            .updateResponse(mid, uid, response)
            .then(() => {
                res.send({
                    success: true,
                    message: '修改成功',
                });
            })
            .catch(next);
    },
);

// 修改会议信息

export default router;
