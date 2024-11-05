require('dotenv').config()
const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const userController = require("./controllers/userControllers")
const collectionController = require("./controllers/collectionControllers")
const photoController = require("./controllers/photoControllers")
const requireAuth = require("./middleware/requireAuth")
const connectToDb = require("./config/connectToDb")
const session = require('express-session')






const app = express()



connectToDb()

app.use(express.json())
app.use(cors({
    origin: true,
    credentials: true,
}))
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
}))
app.use(cookieParser())


app.post("/signup", userController.signup);
app.get("/verify-email")
app.get("/verify-email/:id/verify/:token", userController.verifyEmail)
app.post("/login",  userController.login);
app.post("/resendEmail", userController.sendEmailVerification)
app.get("/logout",  userController.logout);
app.get("/checkAuth", requireAuth, userController.checkAuth);

app.post("/forget-password", userController.forgetPassword)
app.post("/resetPassword/:token", userController.resetPassword)

app.get("/collections",  requireAuth, collectionController.fetchCollections);
app.get("/collections/:id", requireAuth, collectionController.fetchCollection);
app.get("/image/:id/collections", requireAuth, collectionController.fetchCollectionImg)
app.post("/collections",  requireAuth, collectionController.createCollection);
app.delete("/collections/:id", requireAuth, collectionController.deleteCollection);

app.get("/collections/:id/image", requireAuth, photoController.fetchImages)
app.get("collections/:id/image", requireAuth, photoController.fetchImage)
app.get("/image/:id", requireAuth, photoController.fetchImage)
app.post("/collections/:id/image", requireAuth, photoController.addImage)
app.delete("/image/:id", requireAuth, photoController.deleteImage)




app.listen(`${process.env.PORT}`, console.log(`listening on Port ${process.env.PORT}`));
