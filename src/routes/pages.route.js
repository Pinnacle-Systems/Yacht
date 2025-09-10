import { Router } from 'express';
const router = Router();
import { get, getPermissions, getOne, getSearch, create, update, remove } from '../controllers/pages.controller.js';


router.post('/', create);

router.get('/', get);

router.get('/:id', getOne);

router.get("/getPermissions/:pageId/:roleId", getPermissions);

router.get('/search/:searchKey', getSearch);

router.put('/:id', update);

router.delete('/:id', remove);

export default router;