import { Router } from "express";
const router = Router();
import { get, getOne, create, update, remove} from '../controllers/purchaseInwardEntry.controller.js';
import { multerUploadForGrid } from "../utils/multerUpload.js";

router.post('/',multerUploadForGrid.array('images'), create);

router.get('/', get);
router.put('/:id',multerUploadForGrid.array('images'),update);

router.get('/:id', getOne);
router.delete('/:id', remove);

export default router;