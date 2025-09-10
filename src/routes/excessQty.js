import { Router } from 'express';
const router = Router();
import { get, getOne, getSearch, create, update, remove, createApprover, updateApprover } from '../controllers/excessQty.controller.js';


router.post('/', create);

router.post('/createApprover', createApprover)

router.get('/', get);

router.get('/:id', getOne);

router.get('/search/:searchKey', getSearch);

router.put('/:id', update);

router.put('/id', updateApprover)

router.delete('/:id', remove);

export default router;