import { Router } from 'express';

import { avatarUpload } from '../middleware/multer';
import logger from '../utils/logger';

const router = Router();

// 注册
router.post('/avatar', avatarUpload.single('avatar'), (req, res) => {
    if (!req.file) {
        res.status(400).send({
            success: false,
            message: '上传失败',
        });
        return;
    }
    logger.info(`upload avatar: ${req.file.filename}`);
    res.status(201).send({
        success: true,
        data: {
            avatar: req.file.filename,
        },
    });
});

export default router;
