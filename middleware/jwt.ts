import { expressjwt } from 'express-jwt';

import { JWT_SECRET } from '../config';

const jwtHandler = expressjwt({
    secret: JWT_SECRET,
    algorithms: ['HS256'],
});

export default jwtHandler;
