import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
    res.send('Meetings');
    console.log('Meetings');
});

export default router;
