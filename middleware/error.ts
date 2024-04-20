import { ErrorRequestHandler } from 'express';

import logger from '../utils/logger';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    logger.error(err);
    let errorCode: number = 500;
    let errorMsg: string = '服务器错误';
    if (err instanceof Error) {
        errorCode = err.cause as number;
        errorMsg = err.message;
    }
    res.status(errorCode).send({
        success: false,
        message: errorMsg,
    });
};

export default errorHandler;
