import { ErrorRequestHandler } from 'express';

import logger from '../utils/logger';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    logger.error(err);
    res.status(err.status).send({
        success: false,
        message: err.message,
    });
};

export default errorHandler;
