import multer, { memoryStorage } from 'multer';

const storage = memoryStorage();
const fileFilter = (_req, file, cb) => {
  if (file.mimetype.includes('image')) {
    cb(null, true);
  } else {
    cb(new Error('Please choose a valid image file.'), false);
  }
};

export default (fileSize) => multer({ storage, limits: { fileSize }, fileFilter }).single('image');
