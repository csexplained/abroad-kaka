import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'
import { configDotenv } from "dotenv";

configDotenv({
    path: "./.env"
})

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            throw new Error("Local file path is Required ")
        }
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        if (fs.existsSync(localFilePath)) {
        }
        throw error;
    }
};


const deletefromcloudinary = async (public_id) => {
    try {
        const response = await cloudinary.uploader.destroy(public_id, { invalidate: true });
        return response;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

const videodeletefromcloudinary = async (public_id) => {
    try {
        const response = await cloudinary.uploader.destroy(public_id, {
            invalidate: true,
            resource_type: "video"
        });
        return response;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

export { uploadOnCloudinary, deletefromcloudinary, videodeletefromcloudinary } 