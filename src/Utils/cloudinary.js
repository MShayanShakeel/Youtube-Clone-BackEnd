import { v2 as cloudinary } from 'cloudinary';
const fs = require("fs")


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});


const UploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const responce = await cloudinary.uploader.upload(
            localFilePath, {
            resource_type: auto
        })
        console.log("file Upload on cloudinary ", responce.url);
        return responce;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}

module.exports = UploadOnCloudinary




