import { Router } from "express";
const router = Router();
import { get, getOne, create, update, remove} from '../controllers/purchaseInwardEntry.controller.js';

router.post('/', create);

router.get('/', get);
router.put('/:id', update);

router.get('/:id', getOne);
router.delete('/:id', remove);

export default router;