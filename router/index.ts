import type { Router, Express } from 'express';
import fs from 'fs';
import path from 'path';

async function setupRouters(app: Express) {
    let files = await fs.promises.readdir(__dirname);
    files = files.filter(
        file => file !== 'index.ts' && path.extname(file) === '.ts',
    );
    for (const file of files) {
        const { default: router } = await import(path.resolve(__dirname, file));
        app.use('/api/' + file.split('.')[0], router);
    }
}

export default setupRouters;
