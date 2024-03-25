import { createClient } from "redis";

import logger from "./logger";

// 创建 Redis 客户端实例
const client = createClient();

// 设置错误处理
client.on("error", (err) => {
    logger.error(`Redis Client Error: ${err}`);
});

client.connect().catch(err => {
    logger.error(`Redis Client Connect Error: ${err}`);
    process.exit(1);
});

export default client;
