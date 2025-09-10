// src/routes/styleSheetRoutes.route.js
import { Router } from 'express';
import { 
  get, 
  getOne, 
  create, 
  update, 
  remove 
} from '../controllers/styleSheetController.js';
import multerUpload from '../utils/multerUpload.js';

const router = Router();
router.post('/', multerUpload.single('fabricImage'), create);

router.put('/:id', multerUpload.single('fabricImage'), update);

router.get('/', get);

router.get('/:id', getOne);

router.delete('/:id', remove);


export default router;
