const { compareSync } = require("bcryptjs")
const imageCollection = require("../models/imageCollection")
const Image = require("../models/image")


const fetchCollections = async (req, res) => {
   
    try {
        const collections = await imageCollection.find({ user: req.user._id })
        .sort({ createdAt: 1})
        .populate({ path: "images.image", model: "Image"})
        res.json({ collections })
    } catch (err) {
        console.log(err)
        res.sendStatus(400)
    }

}

const fetchCollectionImg = async (req, res) => {

    const imageId = req.params.id
    
    try {
    
        const collections = await imageCollection.find({  _id: imageId })
        .populate("images")
        res.json({ collections })
        console.log(imageId)
     
    } catch (err) {
        console.log(err)
        res.sendStatus(400)
    }
}

const fetchCollection = async (req, res) => {

    const collectionId = req.params.id;

    try {

    const collection = await imageCollection.findOne({ _id: collectionId, user: req.user._id })
    .populate({ path: "images", model: "Image"})
  
    res.json({ collection })
   

    } catch (err) {
        console.log(err)
        res.sendStatus(400)
    }
}


const createCollection = async (req, res) => {
    
    try {
    const { name } = req.body;
    const collection = await imageCollection.create({
       
        name,
        user: req.user._id,
    });
    collection.save()
    res.json({ collection })
} catch (err) {
    console.log(err)
    res.sendStatus(400)
}
}

const deleteCollection = async (req, res) => {
    try {

    const collectionId = req.params.id;

    await imageCollection.deleteOne({ _id: collectionId, user: req.user._id })

    res.json({success: "Collection Deleted"})

    } catch (err) {
        console.log(err)
        res.sendStatus(400)
    }
}

module.exports = {
    createCollection,
    fetchCollections,
    fetchCollection,
    deleteCollection,
    fetchCollectionImg,
}