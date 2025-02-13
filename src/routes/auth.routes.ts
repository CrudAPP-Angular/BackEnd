import express from 'express';

const router = express.Router();

import { login, getToken, logout, adminLogin, verifyToken } from '../controllers/auth.controller';

router.post('/login', login);
router.get('/getToken', getToken);
router.get('/logout', logout);

router.post('/adminLogin', adminLogin);

//*Common Routes
router.post('/verifyToken', verifyToken);


export default router;