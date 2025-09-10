import { Router } from 'express';
const router = Router();
import { get, getPaginated, getOne, getSearch, create, update, remove } from '../controllers/employees.controller.js';
import multer from 'multer';

const upload = multer()

router.post('/', upload.single('image'), create);

router.get('/', get);

router.get('/paginate', getPaginated);

router.get('/:id', getOne);

router.get('/search/:searchKey', getSearch);

router.put('/:id', upload.single('image'), update);

router.delete('/:id', remove);

export default router;