import { v2 as cloudinary } from "cloudinary";

import dotenv from "dotenv";
dotenv.config();  

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadToCloudinary = async (
  buffer: Buffer,
  filename: string
): Promise<string> => {
  const base64 = buffer.toString("base64");
  const dataUri = `data:image/jpeg;base64,${base64}`; // Adjust MIME type if needed

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "uploads",
    public_id: filename,
    resource_type: "image",
  });
 
  return result.secure_url;
};
