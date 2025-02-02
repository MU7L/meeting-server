import type { Express } from 'express';
import fs from 'fs';
import path from 'path';

import logger from '../utils/logger';

const baseURL = '/api';

async function setupRouters(app: Express) {
    let files = await fs.promises.readdir(__dirname);
    files = files.filter(
        file => file !== 'index.ts' && path.extname(file) === '.ts',
    );
    for (const file of files) {
        const api = baseURL + '/' + file.split('.')[0];
        const { default: router } = await import(path.resolve(__dirname, file));
        app.use(api, router);
        logger.info(`Registered router for ${api}`);
    }
}

export default setupRouters;
