import { Router } from 'express';

import { avatarHandler } from '../middleware/multer';

const router = Router();

// 注册
router.post('/', avatarHandler.single('avatar'), (req, res) => {
    if (!req.file) {
        res.status(400).send({
            success: false,
            message: '上传失败',
        });
        return;
    }
    res.status(201).send({
        success: true,
        data: {
            avatar: `/uploads/${req.file.filename}`,
        },
    });
});

export default router;
