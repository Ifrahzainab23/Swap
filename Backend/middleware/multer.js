import multer from 'multer'
const storage = multer.diskStorage({
    filename:function(req,file,callback){
        // callback(req,file.originalname)
        callback(null, Date.now() + "-" + file.originalname);
    }
    }
)
const upload=multer({storage})
export default upload