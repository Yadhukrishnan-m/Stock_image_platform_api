
import { authenticateUser } from "../middleware/auth.middleware";
import { getUser, login, logout, refreshToken, register, resetPassword } from "../controllers/auth.controllers"; // Correct import for register
import express, { Router, Request, Response } from "express";
import upload from "../middleware/multer";
import { deleteImage, editImage, getImages, updateImageOrder, uploadImages } from "../controllers/image.controllers";

const router = Router();


// Test route
router.get("/user", (req: Request, res: Response) => {
  res.json({ message: "User route working" });
});

router.post("/register", register);
router.post("/login", login);
router.post("/change-password",authenticateUser, resetPassword);
router.post("/logout", authenticateUser, logout);
router.post("/refresh-token", refreshToken); 

router.post("/upload-images",authenticateUser,upload.array("images", 10),uploadImages)

router.get("/get-images", authenticateUser, getImages);
router.delete("/delete-image/:id", authenticateUser, deleteImage); 

router.post("/edit-image",authenticateUser,upload.single("image"),editImage)

router.post("/update-image-order", authenticateUser, updateImageOrder);
router.get("/get-user", authenticateUser, getUser);


export default router;
