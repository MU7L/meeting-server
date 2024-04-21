import { Router } from 'express';
import { Request as JWTRequest } from 'express-jwt';
import { matchedData, query } from 'express-validator';

import jwtMiddleware from '../middleware/jwt';
import meetingService from '../service/meeting';

const router = Router();

// 预定
router.post('/', jwtMiddleware, async (req: JWTRequest, res) => {
    if (!req.auth) throw new Error('用户无权限', { cause: 401 });
    const id = req.auth.id;
    const { start, end, teams, attendees } = matchedData(req);
});

// 取消

// 查找

// 查询范围内的会议
router.get(
    '/',
    query('start')
        .isEmpty()
        .withMessage('缺少起始日期')
        .isISO8601()
        .withMessage('起始日期格式错误')
        .toDate(),
    query('end')
        .isEmpty()
        .withMessage('缺少结束日期')
        .isISO8601()
        .withMessage('结束日期格式错误')
        .toDate(),
    jwtMiddleware,
    async (req: JWTRequest, res) => {
        if (!req.auth) throw new Error('用户无权限', { cause: 401 });
        const id = req.auth.id;
        const { start, end } = matchedData(req);
        try {
            const data = await meetingService.getByRange(id, start, end);
            res.send({
                success: true,
                data,
            });
        } catch (err) {
            throw err;
        }
    },
);

// 修改会议信息

// 提交会议响应

export default router;
