import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  phone: string;
  password: string;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
); 

export const User= mongoose.model<IUser>("User", userSchema);
