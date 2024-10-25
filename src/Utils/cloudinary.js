const cloudinary = require('cloudinary').v2;
const fs = require("fs")


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
});


const UploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        console.log("Uploading file:", localFilePath);
        const responce = await cloudinary.uploader.upload(
            localFilePath, {
            resource_type: "auto"
        })
        console.log("file Upload on cloudinary ", responce.url);
        // fs.unlinkSync(localFilePath)
        return responce;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null
    }
}

module.exports = UploadOnCloudinary




