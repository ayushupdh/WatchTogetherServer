const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("./aws");

// Filters for images
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type, only JPEG and PNG is allowed!"), false);
  }
};

// Upload the file to S3 using multer
const upload = multer({
  fileFilter,
  limits: { fileSize: 1024 * 1024 },
  storage: multerS3({
    acl: "public-read",
    s3,
    bucket: process.env.BUCKET_NAME,
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "_" + file.originalname);
    },
  }),
});

module.exports = upload;

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "./uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   try {
//     if (
//       file.mimetype === "image/jpeg" ||
//       file.mimetype === "image/png" ||
//       file.mimetype === "video/mp4"
//     ) {
//       cb(null, true);
//     } else {
//       cb(new Error("File type is not suppported"), false);
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };
// const upload = multer({
//   storage,
//   limits: { fileSize: 1024 * 1024 * 10 },
//   fileFilter: fileFilter,
// });

// module.exports = { upload };
