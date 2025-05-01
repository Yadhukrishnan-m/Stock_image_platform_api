import { Image } from "../models/image.model";
import { uploadToCloudinary } from "../config/clowdinary";
import { NextFunction, Request, Response } from "express";
import { CustomError } from "../utils/customError";
import { MESSAGES } from "../config/constants/messages";
import { STATUS_CODES } from "../config/constants/status-code";
interface AuthenticatedRequest extends Request {
  userId: string;
}

export const uploadImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    let titles = req.body.titles;
    const { userId } = req as AuthenticatedRequest;

    if (!files || files.length === 0) {
      res.status(400).json({ message: "No files uploaded." });
      return;
    }

    if (!Array.isArray(titles)) {
      titles = [titles];
    }

    if (titles.length !== files.length) {
      res.status(400).json({
        message: `Number of titles (${titles.length}) does not match number of files (${files.length}).`,
      });
      return;
    }

    const userImagesCount = await Image.countDocuments({ userId });

    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const title = titles[i];

      const imageURL = await uploadToCloudinary(file.buffer, title);

      const newImage = new Image({
        title: title,
        imageURL: imageURL,
        userId: userId,
        order: userImagesCount + i + 1, // Set order based on the existing images
        createdAt: new Date(),
      });

      await newImage.save();

      uploadedImages.push(newImage);
    }
    const updatedimages= await Image.find({ userId }).sort({ order: 1 });    

    res.status(200).json({
      message: "Upload successful",
      success: true,
      images: updatedimages,
    });
  } catch (error) {
    next(error);
  }
};

export const getImages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const uploadImages = await Image.find({ userId }).sort({ order: 1 });

    res.status(200).json({
      message: MESSAGES.DATA_FETCH_SUCCESS,
      success: true,
      images: uploadImages,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { id } = req.params;

    const image = await Image.findOne({ _id: id });

    if (!image) {
      throw new CustomError(MESSAGES.NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    if (image.userId.toString() !== userId) {
      throw new CustomError(
        MESSAGES.UNAUTHORIZED_ACCESS,
        STATUS_CODES.UNAUTHORIZED
      );
    }

    await Image.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};



export const editImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { _id, title } = req.body;

    let imageURL: string | undefined;

    // If an image file is present, upload it and include it in update
    if (req.file) {
      imageURL = await uploadToCloudinary(req.file.buffer, title);

      const updatedImage = await Image.findByIdAndUpdate(
        _id,
        {
          title,
          ...(imageURL && { imageURL }),
        },
        { new: true }
      );

      const images = await Image.find().sort({ order: 1 });

       res.status(200).json({
        success: true,
        message: "Image updated successfully",
        data: updatedImage,
        images,
      });
      return 
    }

    const updatedImage = await Image.findByIdAndUpdate(
      _id,
      { title },
      { new: true }
    );

    const images = await Image.find().sort({ order: 1 });

     res.status(200).json({
      success: true,
      message: "Image updated successfully",
      data: updatedImage,
      images,
    });
  } catch (error) {
    next(error);
  }
};


export const updateImageOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req as AuthenticatedRequest;
    const reorderedImages: { _id: string; order: number }[] = req.body;

     for (const imageData of reorderedImages) {
       const { _id, order } = imageData;
       await Image.findByIdAndUpdate(_id, { order });
     }

    
        res.status(STATUS_CODES.OK).json({
          success: true,
          message: MESSAGES.UPDATE_SUCCESS
        });
    
  } catch (error) {
    next(error);
  }
};



