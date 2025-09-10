import { Router } from 'express';
const router = Router();
import { get, getOne, getSearch,  create, update, remove} from '../controllers/tagType.controller.js';
import multerUpload from '../utils/multerUpload.js';


router.post('/',multerUpload.single('file'), create);

router.get('/', get);

router.get('/:id', getOne);

router.get('/search/:searchKey', getSearch);

router.put('/:id', update);

router.delete('/:id', remove);

export default router;