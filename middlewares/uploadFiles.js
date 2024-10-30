
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/invoices/'); // Directory where files will be saved
    },
    filename: function (req, file, cb) {
      cb(null, "invoice" + Date.now() + path.extname(file.originalname));
    }
  });
  
  // Initialize upload middleware
  const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // Limit file size to 1MB
    // fileFilter: function (req, file, cb) {
    //   checkFileType(file, cb);
    // }
  }) // Accept a single file with the field name 'myFile'
  

  module.exports = upload