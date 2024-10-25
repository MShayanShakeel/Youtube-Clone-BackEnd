const asyncHandler = require("../Utils/asyncHandler.js");
const { customApiError } = require("../Utils/customError.js");
const User = require('../Models/user.models.js')
const customApiResponce = require('../Utils/customResponce.js')
const UploadOnCloudinary = require('../Utils/cloudinary.js');
const { clearCookie, json } = require("express/lib/response.js");
const JWT = require('jsonwebtoken')




// +++++++++++++  GENERATE REFRESH AND ACCEESS TOKEN START HERE    +++++++++++++ 
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generatSecretToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new customApiError(500, "SomeThing Want to wrong while Generating the Refresh and Access Token!")
    }
}
// +++++++++++++  GENERATE REFRESH AND ACCEESS TOKEN END HERE    +++++++++++++ 






// +++++++++++++  REGIISTER USER FUNCTION START HERE   +++++++++++++ 
const registerUser = asyncHandler(async (req, res) => {
    // +++++++++++++ FIRST GET DATA IN FRON END    +++++++++++++
    // console.log("req.files:", req.files);
    // console.log("req.body:", req.body);
    const { userName, fullName, email, password } = req.body;
    console.log(userName, fullName, email, password);
    // +++++++++++++  SECOND VALIDATE  ALL FIELDS FILLED OR NOT   +++++++++++++ 
    if (
        [userName, fullName, email, password].some((fields) => fields?.trim === "")
    ) {
        throw new customApiError(400, "AlL fields are required")
    }
    // +++++++++++++ THIRD  CHECK IF USER ALREADY EXIST OR NOT   +++++++++++++ 
    const existedUser = await User.findOne(
        { $or: [{ userName }, { email }] })

    if (existedUser) {
        throw new customApiError(409, "User already exist with same email or user name")
    }

    // +++++++++++++  CHECK IMAGE ,AVATAR IMAGE   +++++++++++++ 
    const avatarFile = req.files?.avatar?.[0];
    const coverImageFile = req.files?.coverImage?.[0];

    if (!avatarFile) {
        throw new customApiError(400, "Avatar file is required");
    }

    const avatarLocalPath = avatarFile.path;
    const coverImageLocalPath = coverImageFile?.path;



    // console.log("avatarLocalPath:", avatarLocalPath);
    // console.log("coverImageLocalPath:", coverImageLocalPath);

    const avatar = await UploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await UploadOnCloudinary(coverImageLocalPath) : null;


    // console.log("avatar:", avatar);
    // console.log("coverImage:", coverImage);

    if (!avatar || !avatar?.url) {
        throw new customApiError(400, "Failed to upload avatar image");
    }
    // +++++++++++++  CREATE USER OBJEXT AND SAVE DATA BASE    +++++++++++++ 
    const user = await User.create({
        userName: userName.toLowerCase(),
        fullName,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    })

    // +++++++++++++REMOVE PASSWORD AND TOKEN IN REAPONCE    +++++++++++++     

    const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // +++++++++++++CHECK FOR USER CREATION     +++++++++++++   
    if (!createUser) {
        throw new customApiError(500, "Something want to wrong while creating user!")
    }

    // +++++++++++++RETURN RES    +++++++++++++   
    return res.status(201).json(
        new customApiResponce(200, createUser, "User Register Succesfully!")
    )



})
// +++++++++++++  REGIISTER USER FUNCTION END HERE   +++++++++++++ 






// +++++++++++++  USER LOGIN FUNCTION START HERE   +++++++++++++ 
const userLogin = asyncHandler(async (req, res) => {
    // FIRST GET DATA IN FRONT END 
    const { email, password } = req.body;
    if (!email) {
        throw new customApiError(400, "Email or Password Required!")
    }
    // console.log(email, "email");
    // SECOND FIND USER USING EMAIL 
    const user = await User.findOne({ email })
    if (!user) {
        throw new customApiError(404, "User does not exist!")
    }
    // console.log(user, "userwgrfw");

    const isPasswordValid = await user.isPasswordIsCorrect(password);
    // console.log(isPasswordValid, "isPasswordValidisPasswordValid");
    if (!isPasswordValid) {
        throw new customApiError(401, "Invalid user credentials")
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    // const loggedInUser = await User.findById(user._id).select('-password , -refreshToken')
    const loggedInUser = await User.findById(user._id).select({ password: 0, refreshToken: 0 })

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new customApiResponce(200, {
            user: loggedInUser,
            accessToken,
            refreshToken,
        }, "User Login Succesfully!"))
})
// +++++++++++++  USER LOGIN FUNCTION END HERE   +++++++++++++ 









// +++++++++++++  // LOGOUT FUNCTION START HERE    +++++++++++++ 
const userLogOut = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        return res.status(400).json(new customApiError(400, {}, "User not logged in"));
    }
    console.log("User ID:", req.user._id);
    await User.findByIdAndUpdate(
        req.user._id,

        { $set: { refreshToken: undefined } },
        { new: true }
    )
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict'
    }
    // return res.status(200,
    //     clearCookie("accessToken", options),
    //     clearCookie("refreshToken", options).json(new customApiError(200, {}, "User Logout Succesfully!"))
    // )
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);

    return res.status(200).json({ message: "User logged out successfully!" });
})
// +++++++++++++  // LOGOUT FUNCTION END HERE    +++++++++++++ 








// +++++++++++++  // REFRESH TOKEN LOGIC START HERE    +++++++++++++ 
const refreshAcccessToken = asyncHandler(async (req, res) => {
    const upComingToken = req.cookie.refreshToken || req.body.refreshToken

    if (!upComingToken) {
        throw new customApiError(401, "Unauthorized request!")
    }
    try {
        const decodedToken = JWT.verify(
            upComingToken, process.env.REFRESH_TOKEN_SECRET_KEY
        )
        const user = await User.findOne(decodedToken?._id)

        if (!user) {
            throw new customApiError(401, "Invalid Refresh Token!")
        }

        if (upComingToken !== user?.refreshToken) {
            throw new customApiResponce(401, "Refresh Token expire or used")
        }
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict'
        }
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new customApiResponce(200,
                { accessToken, refreshToken },
                "Refresh Token Generated Succesfully"
            ))
    } catch (error) {
        throw new customApiError(401, error?.message || "Invalid Refresh Token")
    }
})
// +++++++++++++  // REFRESH TOKEN LOGIC END HERE    +++++++++++++ 









// +++++++++++++  // SINGLE USER GET LOGIC START HERE    ++++++++++++++
const getUser = asyncHandler(async (req, res) => {
    return res
        .json(200,
            req.user,
            "Current Login User Fetch Succesfully!"
        )
})
// +++++++++++++  // SINGLE USER GET LOGIC END HERE    ++++++++++++++









// +++++++++++++  // EDIT USER PASSWORD LOGIC START HERE    +++++++++++++
const userPasswordUpdate = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new customApiError(400, "Current Password or New Password Must be required")
    }

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordIsCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new customApiError(400, "Password is not Correct!")
    }

    user.password = newPassword;
    user.save({ validateBeforeSave: false })

    return res.status(200)
        .json(new customApiError(200, {}, "Password Update Succesfully!"))
})
// +++++++++++++  // EDIT USER PASSWORD LOGIC END HERE    ++++++++++++++








// +++++++++++++  // EDIT USER PORFILE LOGIC START HERE    ++++++++++++++
const userProfileUpdate = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new customApiError(400, "All fields are required!");
    }

    const user = await User.findOneAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {
            new: true
        }
    ).select("-password")
    return res
        .status(200)
        .json(200,
            { user },
            "User Infomation Update Succesfully!"
        )
})
// +++++++++++++  // EDIT USER PORFILE LOGIC END HERE    ++++++++++++++











// +++++++++++++  // USER AVATAR UPDATE LOGIC START HERE   ++++++++++++++
const userAvatarUpdate = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file.path
    if (!avatarLocalPath) {
        throw new customApiError(400, "Avatar File Is Missing!")
    }

    const avatar = await UploadOnCloudinary(avatarLocalPath)
    if (!avatar.url) {
        throw new customApiError(400, "Error While Uploading Avatar Image")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: { avatar: avatar.url, }
        },
        { new: true }
    ).select("-password")
    return res
        .status(200)
        .json(new customApiResponce(200, { user }, "Avatar Image Upload succesfully!"))

})
// +++++++++++++  // USER AVATAR UPDATE LOGIC END HERE   ++++++++++++++









// +++++++++++++  // USER COVER IMAGE UPDATE LOGIC START HERE   ++++++++++++++
const userCoverImageUpdate = asyncHandler(async (req, ers) => {
    const localCoverImagePath = req.file.path

    if (!localCoverImagePath) {
        throw new customApiError(400, "Cover image Must Required!")
    }
    const coverImage = await UploadOnCloudinary(localCoverImagePath)
    if (!coverImage.url) {
        throw new customApiError(400, "Error While Uploading the CoverImage")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { coverImage: coverImage.url },
        { new: true }
    ).select("-password")
    return res.status(200)
        .json(new customApiResponce(200, { user }, "Cover Image Upload succesfully!"))
})
// +++++++++++++  // USER COVER IMAGE UPDATE LOGIC END HERE   ++++++++++++++








// +++++++++++++  // GET USER CHANNEL PROFILE LOGIC START HERE   ++++++++++++++
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { userName } = req.params

    if (!userName.trim()) {
        throw new customApiError(200, "UserName Must be reuired!")
    }

    // AGGREGATION PIPILINE START HERE 
    const channel = await User.aggregate([
        {
            $match: {
                userName: userName?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscribers",
                localField: "_id",
                foreignField: "channel",
                as: "mySubscribers"
            },
            $lookup: {
                from: "subscribers",
                localField: "_id",
                foreignField: "subscriber",
                as: "iSubscribedChannel"
            },
            $addFields: {
                mySubscriberCount: {
                    $size: "$   "
                },
                ISubscribedChannelsList: {
                    $size: "iSubscribedChannel"
                },
                isSubscribed: {
                    if: { $in: [req.user?._id, "$mySubscribers.subscriber"] },
                    then: true,
                    else: false
                }
            }
        },
        {
            $project: {
                userName: 1,
                fullName: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                mySubscriberCount: 1,
                ISubscribedChannelsList: 1,
                isSubscribed: 1,
            }
        }
    ])


    if (!channel.length) {
        throw new customApiError(404, "Channel Done Not Exist!")
    }
    return res
        .status(200)
        .json(new customApiResponce(200, channel[0], "Channel Fetch Succesfully!"))
})
// +++++++++++++  // GET USER CHANNEL PROFILE LOGIC END HERE   ++++++++++++++






module.exports = {
    registerUser,
    userLogin,
    userLogOut,
    refreshAcccessToken,
    getUser,
    userPasswordUpdate,
    userProfileUpdate,
    userAvatarUpdate,
    userCoverImageUpdate,
    getUserChannelProfile,
};





