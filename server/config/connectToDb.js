require('dotenv').config()
const mongoose = require("mongoose")

async function connectToDb () {
    try {
        await mongoose.connect(`mongodb+srv://andydrums87:is${process.env.MONGO_ID}.wtpnp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1`)
        
        console.log("Connected to Db")
    } catch (err) {
        console.log(err)
    }
    }
   

module.exports = connectToDb;