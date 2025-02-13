import express from 'express';

import upload from '../utils/multerConfig.utils';

import { saveUser, uploadImage, getUsers, updateStatus, search } from '../controllers/user.controller';
import checkUserExists from '../middlewares/isUserExists.middleware';
import { authorizeToken } from '../middlewares/authorizeToken.middleware';
import { checkIfBlocked } from '../middlewares/checkIfBlocked.middleware';

const router = express.Router();

router.post('/register', checkUserExists, saveUser);

router.put('/uploadImage', authorizeToken, upload.single('file'), uploadImage);

router.put('/updateStatus', updateStatus);

router.get('/searchUser', search);

router.get('/getUsers', getUsers);


// router.get('/data', getUser);

export default router;