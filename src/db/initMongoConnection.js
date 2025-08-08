import mongoose from 'mongoose';

import { getEnvVar } from '../utils/getEnvVar.js';

export const initMongoConnection = async () => {
  try {
    const dbUser = getEnvVar('MONGODB_USER');
    const dbPassword = getEnvVar('MONGODB_PASSWORD');
    const dbUrl = getEnvVar('MONGODB_URL');
    const dbName = getEnvVar('MONGODB_DB');
    await mongoose.connect(
      `mongodb+srv://${dbUser}:${dbPassword}@${dbUrl}/${dbName}?retryWrites=true&w=majority&appName=Cluster01`,
    );
    console.log(`Mongo connection successfully established!`);
  } catch (error) {
    console.log(`Error connection database ${error.message}`);
  }
};
