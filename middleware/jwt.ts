import { expressjwt } from 'express-jwt';

import { secret } from '../../config';

const jwtMiddleware = expressjwt({
    secret,
    algorithms: ['HS256'],
});

export default jwtMiddleware;
