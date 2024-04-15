import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';

const validationErrorMiddleware: RequestHandler = (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).send({
            message: result
                .array()
                .map(item => item.msg)
                .join('\n'),
        });
    }
    next();
};

export default validationErrorMiddleware;
