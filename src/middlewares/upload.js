import multer from 'multer';
import createHttpError from 'http-errors';

import { TEMP_UPLOAD_DIR } from '../constants/index.js';

const storage = multer.diskStorage({
  //   destination: TEMP_UPLOAD_DIR,  <-- якщо немає жодних перевірок, всі файли зберіг в папці
  destination: (req, file, cb) => {
    cb(null, TEMP_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniquePreffix = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    const filename = `${uniquePreffix}_${file.originalname}`;
    cb(null, filename);
  },
});

const limits = {
  fileSize: 1024 * 1024 * 5, // байти * кілобайти * мегабайти
};

const fileFilter = (req, file, cb) => {
  const extension = file.originalname.split().pop();
  if (extension === 'exe') {
    return cb(createHttpError(400, '.exe extension not allowed'));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  limits,
  fileFilter,
});
