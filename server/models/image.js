const mongoose = require("mongoose")

const imageSchema = new mongoose.Schema({
    
    unsplashId: {
        type: String,
        required: true,
    },

    userName: {
        type: String,
        required: true,
    },
    // filename: {
    //     type: String,
    //     required: false,
    // },
    url: {
        raw: String, full: String, regular: String, small: String, thumb: String, small_s3: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    collection: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'imageCollection'
    }],
    profileImageUrl: {
        type: String,
        required: true,
    },
    publishedDate: {
        type: Date,
        required: true
    },
    width: {
        type: String,
        required: false
    },
    height: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    }
 
});

const Image = mongoose.model("Image", imageSchema)

module.exports = Image;