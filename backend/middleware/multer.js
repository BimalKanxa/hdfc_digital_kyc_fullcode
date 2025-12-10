const multer = require("multer");

// Store uploaded file temporarily in memory
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only JPG and PNG images are allowed"), false);
  }
  cb(null, true);
};

module.exports = multer({ storage, fileFilter });
