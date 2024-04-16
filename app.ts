import cors from 'cors';
import express, { Express } from 'express';
import { createServer } from 'http';
import path from 'path';

import { API_PORT, ENV } from './config';
import morganMiddleware from './middleware/morgan';
import setupRouters from './router';
import logger from './utils/logger';
import setupSocket from './utils/socket';

logger.info(`env: ${ENV}`);

const app = express();

app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态资源
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());

// 测试路由
app.get('/ping', (_, res) => {
    res.send('pong');
});

/** 启动服务 */
async function setup(app: Express) {
    // await setupDatabse();
    await setupRouters(app);

    const httpServer = createServer(app);
    setupSocket(httpServer);
    httpServer.listen(API_PORT);
}

setup(app)
    .then(() => logger.info(`server started on http://localhost:${API_PORT}`))
    .catch(err => logger.error(err));
