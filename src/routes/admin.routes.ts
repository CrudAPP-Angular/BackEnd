import express from 'express';

import { saveAdmin, getAdmin, loadAdmins, updateStatus } from '../controllers/admin.controller';


const router = express.Router();

router.post('/register', saveAdmin);

router.post('/getAdmin', getAdmin);

router.get('/loadAdmins', loadAdmins);

router.put('/changeStatus', updateStatus);

export default router;