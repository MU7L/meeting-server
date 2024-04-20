import { expressjwt } from 'express-jwt';

import { JWT_SECRET } from '../config';

const jwtMiddleware = expressjwt({
    secret: JWT_SECRET,
    algorithms: ['HS256'],
});

export default jwtMiddleware;
