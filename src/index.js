import { initMongoConnection } from './db/initMongoConnection.js';
import { setupServer } from './server.js';
import { createDirIfNotExist } from './utils/createDirIfNotExist.js';
import { TEMP_UPLOAD_DIR, PUBLIC_DIR } from './constants/index.js';

const bootstrap = async () => {
  await initMongoConnection();
  await createDirIfNotExist(TEMP_UPLOAD_DIR);
  await createDirIfNotExist(PUBLIC_DIR);
  setupServer();
};

bootstrap();
