import { Router } from 'express';
const router = Router();
import { get, getOne, getSearch, create, update, updateMany, remove } from '../controllers/branches.controller.js';


router.post('/', create);

router.get('/', get);

router.get('/:id', getOne);

router.get('/search/:searchKey', getSearch);

router.put('/:id', update);

router.put("/updateMany/:companyId", updateMany);

router.delete('/:id', remove);

export default router;