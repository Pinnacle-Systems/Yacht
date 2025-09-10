import { Router } from 'express';
const router = Router();
import multerUpload from '../utils/multerUpload.js';

import { get, getOne, getSearch, create, update, remove, upload } from '../controllers/partyMaster.controller.js';

router.patch('/upload/:id', multerUpload.single('image'), upload);

router.post('/', create);

router.get('/', get);

router.get('/:id', getOne);

router.get('/search/:searchKey', getSearch);

router.put('/:id', update);

router.delete('/:id', remove);

export default router;