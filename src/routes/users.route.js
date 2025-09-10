import { Router } from 'express';
const router = Router();
import { get, login, getOne, getSearch, create, update, remove, sendOtp, verifyOtp } from '../controllers/users.controller.js';

router.post('/', create);

router.post("/login", login);

router.post("/sendOtp", sendOtp)

router.post("/verifyOtp", verifyOtp)

router.get('/', get);

router.get('/:id', getOne);

router.get('/search/:searchKey', getSearch);

router.put('/:id', update);

router.delete('/:id', remove);

export default router;