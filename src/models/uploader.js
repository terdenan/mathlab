const multer  = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('uploader', req.path);
        if (req.path === '/message') {
            cb(null, './static/public/attachments')
        }
        else {
            cb(null, './static/public/uploads')
        }
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + (file.originalname))
    }
});
const upload = multer({ storage: storage });

module.exports = upload;