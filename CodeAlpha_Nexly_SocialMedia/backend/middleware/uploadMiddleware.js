const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const createStorage = (destination) =>
  multer.diskStorage({
    destination: (req, file, cb) =>
      cb(null, path.join(__dirname, `../uploads/${destination}`)),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
      cb(null, uniqueName);
    },
  });

const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024; // 5MB

const uploadAvatar = multer({
  storage: createStorage("avatars"),
  limits: { fileSize: MAX_SIZE },
  fileFilter: imageFilter,
}).single("avatar");

const uploadPostImage = multer({
  storage: createStorage("posts"),
  limits: { fileSize: MAX_SIZE },
  fileFilter: imageFilter,
}).single("image");

module.exports = { uploadAvatar, uploadPostImage };
