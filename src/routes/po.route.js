import { Router } from 'express';
const router = Router();
import { get, getOne, getSearch, create, update, remove, getPoItems, getPoItemById } from '../controllers/po.controller.js';
import multerUpload, { multerUploadForGrid } from '../utils/multerUpload.js';


router.post('/', create);

router.get('/', get);
router.put('/:id', multerUploadForGrid.array('file'), update);

router.get('/getPoItems', getPoItems);

router.get('/getPoItems/:id/:purchaseInwardReturnId/:stockId/:storeId/:billEntryId/:poType', getPoItemById);

router.get('/:id', getOne);

router.get('/search/:searchKey', getSearch);

// router.put('/:id', update);

router.delete('/:id', remove);

export default router;