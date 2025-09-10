import { Router } from 'express';
import { sendMailWithAttachment, sendMailWithAttachmentWithMultipleFiles } from '../utils/mailer.js';
import multer from 'multer';

const upload = multer();

const router = Router();

router.post('/', upload.single("file"), async (req, res) => {

    await sendMailWithAttachment(req)
    res.json({ statusCode: 0, message: "Mail send" })
});

router.post('/multipleFiles', upload.array("file"), async (req, res) => {
    await sendMailWithAttachmentWithMultipleFiles(req)
    res.json({ statusCode: 0, message: "Mail send" })
});

export default router;
