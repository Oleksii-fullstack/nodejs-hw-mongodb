import { Schema, model } from 'mongoose';
import { handleSaveError, setUpdateSettings } from '../hooks.js';
import { emailRegexp } from '../../constants/auth-constants.js';

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true, // унікальне поле в рамках колекції
      match: emailRegexp, // ключ match = поле має відповідати регулярному виразу
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
);

userSchema.post('save', handleSaveError);

userSchema.pre('findOneAndUpdate', setUpdateSettings);

userSchema.post('findOneAndUpdate', handleSaveError);

const UserCollection = model('user', userSchema);

export default UserCollection;
