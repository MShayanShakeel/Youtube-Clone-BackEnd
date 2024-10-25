const User = require("../Models/user.models.js");
const asyncHandler = require("../Utils/asyncHandler.js");
const { customApiError } = require("../Utils/customError.js");
const JWT = require('jsonwebtoken')

const jwtVerification = asyncHandler(async (req, res, next) => {
    console.log("Request Headers:", req.headers);
    console.log("Request Cookies:", req.cookies);
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        console.log(token, "token");

        if (!token) {
            throw new customApiError(401, "Unauthorized Request!");
        }

        const decodedToken = JWT.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new customApiError(401, "Invalid Access Token");
        }

        req.user = user;
        console.log("User:", req.user);
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error);
        throw new customApiError(401, error?.message || "Invalid Access Token");
    }
});



module.exports = { jwtVerification }