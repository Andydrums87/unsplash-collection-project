require('dotenv').config()
const jwt = require("jsonwebtoken")
const User = require("../models/user")

async function requireAuth(req, res, next) {

try {
    const token = req.cookies.Authorization 

    const decoded = jwt.verify(token, `${process.env.SECRET_KEY}`);

    if(Date.now() > decoded.exp) return res.sendStatus(401)

    const user = await User.findById(decoded.sub);
    if(!user) return res.status(401).send({ message: "user credentials not found"})

    req.user = user;
    next();
} catch (err) {
    return res.sendStatus(401)
}

}

module.exports = requireAuth;