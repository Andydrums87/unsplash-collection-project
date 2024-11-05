const mongoose = require("mongoose")


const imageCollectionsSchema = new mongoose.Schema({
   
    name: {
        type: String,
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    images: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image'
    }],
  
}, { timestamps: true });

const imageCollection = mongoose.model("imageCollection", imageCollectionsSchema)

module.exports = imageCollection;
