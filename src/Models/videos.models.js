const mongoose = require('mongoose');

const VideosSchema = new mongoose.Schema({
    VideoFile: {
        type: String,  //Cloudnary storage
        required: true,
    },
    thumNill: {
        type: String, //Cloudnary storage
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        reff: "User"
    },
    tittle: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    views: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    isPublish: {
        type: Boolean,
        default: true
    },
    duration: {
        type: Number,
    },

},
    {
        timestamps: true
    })

export const Video = mongoose.model('Video', VideosSchema)