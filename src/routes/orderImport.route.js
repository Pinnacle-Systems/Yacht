import { Router } from 'express';
const router = Router();
import { get, getOne, create, update, remove } from '../controllers/orderImport.controller.js';

import multer from 'multer';

const upload = multer()

router.post('/', upload.single('file'), create);

router.get('/', get);

router.get('/:id', getOne);

router.put('/:id', update);

router.delete('/:id', remove);

export default router;