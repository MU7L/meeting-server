import { RequestHandler } from 'express';
import { validationResult } from 'express-validator';

const validationHandler: RequestHandler = (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        const errorMsg = result
            .array()
            .map(item => item.msg)
            .join('\n');
        throw new Error(errorMsg, { cause: 400 });
    } else next();
};

export default validationHandler;
