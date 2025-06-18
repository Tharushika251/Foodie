import mongoose, { Document, Schema } from 'mongoose';

export interface IUser {
  user_id: string;
  name: string;
  email: string;
  password: string;
  licenseNumber: string;
  phone_number: string;
  role: string;
  address: string;
  profile_image?: string;
}

const UserSchema: Schema = new Schema<IUser>({
  user_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  licenseNumber: { type: String, required: false },
  phone_number: { type: String, required: true },
  role: { type: String, required: true },
  address: { type: String, required: true },
  profile_image: { type: String }
});

export default mongoose.model<IUser>('User', UserSchema);