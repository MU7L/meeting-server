import dotenv from 'dotenv';
dotenv.config();

import express from 'express';

import logger from './config/logger';
import morganMiddleware from './middle/morgan';
import loadRouter from './router';

logger.info(`env: ${process.env.NODE_ENV}`);

const port = process.env.SERVER_PORT || 3000;
const app = express();

app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 测试路由
app.get('/', (_, res) => {
    res.send('Hello World!');
});

// 导入路由
loadRouter()
    .then(routerMap => {
        routerMap.forEach((value, key) => {
            app.use(key, value);
        });
    })
    .then(() => {
        // 启动
        app.listen(port, () => {
            logger.info(`Server running at http://localhost:${port}`);
        });
    });
