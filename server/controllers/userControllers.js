require('dotenv').config()
const cors = require("cors")
const bcrypt = require("bcryptjs")
const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")
const User = require("../models/user")



const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'no.relply.unsplash@gmail.com',
      pass: process.env.NODEMAILER_PASSKEY
    }
  });

// async function signup(req, res) {
//     try {
//         const { name, email, password } = req.body
//         const hashedPassword = bcrypt.hashSync(password, 8)

//         const user = await new User({ name, email, password: hashedPassword }).save()
//         if(user) {
//             res.sendStatus(200)
//         }

//         const emailToken = jwt.sign({
//             email: user.email
//         }, `${process.env.SECRET_KEY}`, { expiresIn: '10m'})
//         const verificationUrl = `http://localhost:5173/verify-email/${user._id}/verify/${emailToken}`;
//         const mailOptions = {
//             from: 'andydrums87@gmail.com',
//             to: user.email,
//             subject: 'Verify Your Unsplash Email',
//             html: `<p> Dear ${user.name},<p/>
//                     <p>Thanks for registering on our site</p>
//                     <p> Please click the following link to verify your account: <a href=${verificationUrl}>click here<a/></p>
//                     <p>This link will expire in 10 minutes</p>
//                     <p>Thanks, the Unsplash Team<p/>
//                     `
//         };
//         await emailTransporter.sendMail(mailOptions);
//         res.send('Registrations successful, please verify your email.')
//     }  catch (err) {
//         console.log(err)
//         res.status(401).send({message: "a user with that email already exists"})
//     }
// }


async function signup(req, res) {
    const { name, email, password } = req.body
    const hashedPassword = bcrypt.hashSync(password, 8)
    if(!email) {
        return res.status(422).send({ message: "Missing Email"})
    }
    try {
        const existingUser = await User.findOne({ email })
        if(existingUser) {
            return res.status(409).send({ message: "Email already in use"})
        }
        const user = await new User({ name, email, password: hashedPassword }).save()
        const emailToken = jwt.sign({
            email: user.email
        }, `${process.env.SECRET_KEY}`, { expiresIn: '10m'})

        const verificationUrl = `${process.env.EMAIL_URL}/verify-email/${user._id}/verify/${emailToken}`;
        const mailOptions = {
            from: 'no.relply.unsplash@gmail.com',
            to: user.email,
            subject: 'Verify Your Unsplash Email',
            html: `<p> Dear ${user.name},<p/>
                    <p>Thanks for registering on our site</p>
                    <p> Please click the following link to verify your account: <a href=${verificationUrl}>click here<a/></p>
                    <p>This link will expire in 10 minutes</p>
                    <p>Thanks, the Unsplash Team<p/>
                    `
        };
        await emailTransporter.sendMail(mailOptions);
   
        return res.status(200).send({ message: `We have sent an email verifaction to ${email}`})

    } catch (err) {
        return res.status(500).send(err)
    }

}




async function sendEmailVerification (req, res) {
    const { email } = req.body
    const user = await User.findOne({ email })
    const emailToken = jwt.sign({
        email: user.email
    }, `${process.env.SECRET_KEY}`, { expiresIn: '10m'})
    const verificationUrl = `${process.env.EMAIL_URL}/verify-email/${user._id}/verify/${emailToken}`;
    const mailOptions = {
        from: 'andydrums87@gmail.com',
        to: user.email,
        subject: 'Verify Your Unsplash Email',
        html: `<p> Dear ${user.name},<p/>
                <p>Thanks for registering on our site</p>
                <p> Please click the following link to verify your account: <a href=${verificationUrl}>click here<a/></p>
                <p>This link will expire in 10 minutes</p>
                <p>Thanks, the Unsplash Team<p/>
                `
    };
    await emailTransporter.sendMail(mailOptions);
    res.send('Registrations successful, please verify your email.')
}


async function verifyEmail(req, res) {

    try {

        const user = await User.findById({ _id: req.params.id })
        const emailToken = req.params.token;

        if(user) {
            try {
                jwt.verify(emailToken, process.env.SECRET_KEY);
            } catch (err) {
                return res.status(400).send({ success: false, message: "Invalid verification or Expired"})
            }

            await User.findByIdAndUpdate(user._id, {
                verified: true,
                emailToken: null,
            }) ;
            return res.status(200).send({ success: true, message: "Account Verified"})
        } else {
            return res.status(404).send({ success: false, message: "404 not found"})
        }
    } catch (err) {
        console.log(err)
        return res.status(500). send({ success: false, message: "Internal Server Error"})
    }
}

async function login(req, res) {
 
    try {
        const { email, password  } = req.body;
        if(!email) {
            return res.status(409).send({message: "email is incorrect"})
        }
        const user = await User.findOne({ email })
        if(!user)  {
            return res.status(409).send({message: "email is incorrect"})
        }
     
         
        if(!user.verified) {
            return res.status(403).send({ message: "Please verify your account"})
        }
         
        const passwordMatch = bcrypt.compareSync(password, user.password)
        if(!passwordMatch) return res.status(401).send({ message: 'password is incorrect'})
    
        const exp = Date.now() + 1000 * 60 * 60 * 24 * 30
        const token = jwt.sign({ sub: user._id, exp }, `${process.env.SECRET_KEY}`)
    
        res.cookie("Authorization", token, { 
            expires: new Date(exp),
            httpOnly: true,
            sameSite: 'lax',
            // secure: process.env.NODE_ENV === 'production'
        })
        res.sendStatus(200);
   
        console.log(user)
    } catch (err) {
        console.log(err)
        return res.status(400).send({message: "Error Logging In"})
    }

}

function logout (req, res) {
    try {
        res.clearCookie("Authorization")
        res.status(200).send({message: "Successfully Logged Out"})
    } catch (err) {
        console.log(err)
        return res.status(400).send({ message: "Internal Server Error"})
    }

}

function checkAuth (req, res) {
    try {
        console.log(req.user)
        res.sendStatus(200)
    } catch (err) {
        console.log(err)
        return res.sendStatus(400)
    } 
}

async function forgetPassword (req, res) {

    try {
        const { email } = req.body
        const user = await User.findOne({ email })
       

        if(!user) {
            return res.status(404).send({ message: "user not found"})
        }
    
        const token = jwt.sign({ userId: user._id}, process.env.SECRET_KEY, { expiresIn: "10m" });
        const mailOptions = {
            from: 'no.relply.unsplash@gmail.com',
            to: user.email,
            subject: 'Reset Password',
            html: `<p> Dear ${user.name},<p/>
                    <p>Reset Your Password</p>
                    <p> Please click the following link to reset your password: <a href=${process.env.EMAIL_URL}/resetPassword/${token}>Click here<a/></p>
                    <p>This link will expire in 10 minutes</p>
                    <p>If you didn't request a password reset please ignore this email</p>
                    <p>Thanks, the Unsplash Team<p/>
                    `
        };
        emailTransporter.sendMail(mailOptions, (err) => {
            if(err) {
                return res.status(500).send({ message: err.message})
            }
            res.status(200).send({ message: "Email Sent"})
        })
    } catch (err) {
        res.status(500).send({ message: err.message})
    }
   
}

async function resetPassword (req, res) {
    try {
        const decodedToken = jwt.verify(
            req.params.token,
            process.env.SECRET_KEY
        );

        if(!decodedToken) {
            return res.status(401).send({ message: "Invalid Token"})
        }

        const user = await User.findOne({ _id: decodedToken.userId })

        if(!user) {
            return res.status(401).send({ message: "no user found" })
        }
     
          
        const salt = await bcrypt.genSalt(10);
        req.body.newPassword = await bcrypt.hash(req.body.newPassword, salt)
      
        user.password = req.body.newPassword;
        user.save()

       res.status(200).send({ message: "Password updated"})

    } catch (err) {
        res.status(500).send({ message: err.message})
    }
}

module.exports = {
    signup, 
    login,
    logout,
    checkAuth,
    sendEmailVerification,
    verifyEmail,
    forgetPassword,
    resetPassword,

};