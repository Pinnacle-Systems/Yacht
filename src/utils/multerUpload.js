import multer from 'multer';


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads")
    },
    filename: (req, file, cb) => {
        console.log(file, 'file');
        cb(null, `${Date.now()}${file.originalname}`)
    }
})


const storageForGrid = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads")
    },

    filename: (req, file, cb) => {
        cb(null, `${file.originalname}`)
    }
})
const multerUpload = multer({ storage })

export const receiveOnlyMulter = multer()
export const multerUploadForGrid = multer({ storage: storageForGrid })



export default multerUpload