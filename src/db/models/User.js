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
      unique: true,
      match: emailRegexp,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    verify: {
      type: Boolean,
      default: false,
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
