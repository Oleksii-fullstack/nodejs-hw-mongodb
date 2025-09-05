import fs from 'node:fs/promises';
import path from 'node:path';

import { PUBLIC_DIR } from '../constants/index.js';

export const saveFileToPublicDir = async (file) => {
  const { path: oldPath, filename } = file;
  const newPath = path.join(PUBLIC_DIR, filename);
  await fs.rename(oldPath, newPath);
  //   return path.join('public', filename); <-- було До запису express.static('public') в сервері
  return filename;
};
