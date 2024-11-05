const Image = require("../models/image")

const fetchImages = async (req, res) => {
    const collectionId = req.params.id
    try {
        const images = await Image.find({ user: req.user._id, collection: collectionId })
        .populate("collection")
        res.json({ images })
       
    } catch (err) {
        console.log(err)
        res.sendStatus(400)
    }
}

const fetchImage = async (req, res) => {

    const imageId = req.params.id
    
    
    try {

    const image = await Image.find({ unsplashId : imageId, user: req.user._id }).populate("collection")
    
    res.json({ image })
    
    } catch (err) {
        console.log(err)
        res.sendStatus(400)
    }
}

const addImage = async (req, res) => {
    const collectionId = req.params.id
    
    try {
    const { unsplashId, userName, url, profileImageUrl, publishedDate, height, width, description } = req.body;
    const image = await Image.create({
        unsplashId,
        userName,
        url,
        profileImageUrl,
        publishedDate,
        height,
        width,
        description,

        user: req.user._id,
        collection: collectionId
    })
    image.save()
    console.log(image)
    res.json({ image })
} catch (err) {
    console.log(err)
    res.sendStatus(400)
}
}

const deleteImage = async (req, res) => {
    try {

    const imageId = req.params.id;

    await Image.deleteOne({ _id: imageId, user: req.user._id })

    res.json({success: "Image Deleted"})

    } catch (err) {
        console.log(err)
        res.sendStatus(400)
    }
}

module.exports = {
    addImage,
    fetchImages,
    fetchImage,
    deleteImage,
}