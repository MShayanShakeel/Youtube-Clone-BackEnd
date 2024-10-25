
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken')
const UserSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        lowecase: true,
        unique: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    avatar: {
        type: String, //Cloudnary storage
        required: true,
    },
    coverImage: {
        type: String,  //Cloudnary storage
    },
    password: {
        type: String,
        required: [true, "Password is Required!"],
    },

    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],

    refreshToken: {
        type: String,
    },

},
    {
        timestamps: true
    }
)

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next();
})

UserSchema.methods.isPasswordIsCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

UserSchema.methods.generatSecretToken = async function () {
    JWT.sign({
        _id: this._id,
        email: this.email,
        username: this.UserName,
        fullname: this.fullName
    },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRE_KEY,
        })
}

UserSchema.methods.generateRefreshToken = async function () {
    JWT.sign({
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SECRET_KEY,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRE_KEY,
        })
}



const User = mongoose.model('User', UserSchema)
module.exports = User;