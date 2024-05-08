import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import CustomError from '../utils/error';

const validationHandler: RequestHandler = (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errorMsg = result
            .array()
            .map(item => item.msg)
            .join('\n');
        next(new CustomError(errorMsg, 400));
        return;
    }
    next();
};

export default validationHandler;
