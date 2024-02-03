import knex from 'knex';
import logger from './logger';

const db = knex({
    client: 'mysql2',
    connection: {
        host: 'localhost',
        port: 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    },
    log: {
        warn(message) {
            logger.warn(message);
        },
        error(message) {
            logger.error(message);
        },
    },
});

export default db;
