import mongoose, { Schema, Document, Types } from "mongoose";

export interface IImage extends Document {
  title: string;
  imageURL: string;
  userId: Types.ObjectId;
  order: number;
  createdAt: Date;
}

const imageSchema = new Schema<IImage>({
  title: { type: String, required: true },
  imageURL: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  order: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Image = mongoose.model<IImage>("Image", imageSchema);
