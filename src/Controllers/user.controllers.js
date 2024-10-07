const asyncHandler = require("../Utils/asyncHandler.js");
const { customApiError } = require("../Utils/customError.js");
const { User } = require('../Models/user.models.js')
const customApiResponce = require('../Utils/customResponce.js')



const registerUser = asyncHandler(async (req, res) => {

    // FIRST GET DATA IN FRON END 
    const { userName, fullName, email, password } = req.body;
    console.log(userName, fullName, email, password);
    // SECOND VALIDATE  ALL FIELDS FILLED OR NOT 
    if (
        [userName, fullName, email, password].some((fields) => fields?.trim === "")
    ) {
        throw new customApiError(400, "AlL fields are required")
    }

    // THIRD  CHECK IF USER ALREADY EXIST OR NOT 
    const existedUser = User.findOne(
        { $or: [{ userName }, { email }] })

    if (existedUser) {
        throw new customApiError(409, "User already exist with same email or user name")
    }
    // CHECK IMAGE ,AVATAR IMAGE 
    
    // UPLOAD IMAGE CLOUDNARY 
    // CREATE USER OBJEXT AND SAVE DATA BASE
    const user = User.create({
        userName: userName.toLowerCase(),
        fullName,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    })

    // REMOVE PASSWORD AND TOKEN IN REAPONCE      
    // CHECK FOR USER CREATION
    const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createUser) {
        throw new customApiError(500, "Something want to wrong while creating user!")
    }

    // RETURN RES
    return res.status(201).json(
        new customApiResponce(200, createUser, "User Register Succesfully!")
    )



})
// export { registerUser, }
module.exports = { registerUser };





