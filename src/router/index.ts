import type { Router } from 'express';
import fs from 'fs';
import path from 'path';

/**
 * 加载路由
 *
 * @returns 返回一个 Map 对象，键是路由路径，值是对应的路由对象
 */
async function loadRouter(): Promise<Map<string, Router>> {
    const files = fs
        .readdirSync(__dirname)
        .filter(file => file !== 'index.ts' && path.extname(file) === '.ts');
    const paths = files.map(file => '/' + file.split('.')[0]);
    const routers = (
        await Promise.all(
            files.map(file => import(path.resolve(__dirname, file)))
        )
    ).map(r => r.default) as Router[];
    return new Map(paths.map((p, i) => [p, routers[i]]));
}

export default loadRouter;
