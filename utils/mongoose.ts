import mongoose from 'mongoose';

import { DB_URL } from '../../config';
import logger from './logger';

async function setupDatabse() {
    try {
        await mongoose.connect(DB_URL);
        logger.info('Connected to MongoDB');
    } catch (err) {
        logger.error(err);
    }
}

export default setupDatabse;
