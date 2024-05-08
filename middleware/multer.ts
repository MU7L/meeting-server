import multer from 'multer';
import path from 'path';

const uploadPath = path.join(path.dirname(__dirname), 'public', 'uploads');

const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `avatar-${Date.now()}${ext}`);
    },
});

export const avatarHandler = multer({
    storage: avatarStorage,
});
