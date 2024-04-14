import jwt from 'jsonwebtoken';

import { secret } from '../config';
import logger from '../utils/logger';

const tokenController = {
    sign(id: number) {
        return {
            token: jwt.sign({ id }, secret, { expiresIn: '1h' }),
            refreshToken: jwt.sign({ id }, secret, { expiresIn: '1d' }),
        };
    },
    update() {},
    verify(token: string) {
        try {
            const decode = jwt.verify(token, secret);
        } catch (error) {
            logger.error(String(error));
        }
    },
};

export default tokenController;
