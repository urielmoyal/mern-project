const multer = require("multer");
const uuid = require("uuid");

const ACCEPTED_IMAGE_TYPES = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

const imageUpload = multer({
  limits: 500000,
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, "uploads/images");
    },
    filename: (req, file, callback) => {
      const receivedType = ACCEPTED_IMAGE_TYPES[file.mimetype];
      callback(null, uuid.v1() + "." + receivedType);
    },
  }),
  fileFilter: (req, file, callback) => {
    const isValidType = !!ACCEPTED_IMAGE_TYPES[file.mimetype];
    const error = isValidType ? null : new Error("Invalid File Type");
    callback(error, isValidType);
  },
});

module.exports = imageUpload;
