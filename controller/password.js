require("dotenv").config();
const userModel = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendMail = require("../helpers/email");
const {welcomeEmail} = require("../helpers/emailTemplates");

exports.forgotPassword = async (req, res) => {
    try {
        const {email} = req.body;
        const findEmail = await schoolModel.findOne({email});
        if(!findEmail) {
            return res.status(404).json({
                message: "The user with this email does not exist."
            })
        }
    }
    const name = findEmail.name

    const token = jwt.sign({userId:findEmail._id},
        process.env.jwtSecret,
        {expiresIn:'1d'}
    )
    const verificationLink = `https://medvault-xixt.onrender.com/#/staffRegistration/${token}`
    const html = generateWelcomeEmail(name, verificationLink);
    const emailSubject = 'Rset Password '

    const mailOptions = {
    from: process.env.user,
    to: email, // Use the user's email address here
    subject: emailSubject,
    html: html
};

await sendEmail(mailOptions);

res.status(200).json({message:'email sent successfully', token})
        
    } catch (error) {
        res.status(500).json(error.message)
        
    }
};


const resetPassword = async (req, res) =>{
    try {
        const {token}=req.params
        const {newPassword, confirmPassword} = req.body
        if(newPassword !== confirmPassword){
            return res.status(400).json({message:'password does not match'})
        }
        const decodedToken = jwt.verify(token, process.env.secret_key, )
        const userId = decodedToken.userId
        const user = await schoolModel.findById(userId)
        if(!user){
            return res.status(404).json({message:'user not found'})
        }
        
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hashSync(newPassword, salt)
        user.password = hashedPassword
        await user.save()

        return res.status(200).json({message:'password reset successful'})

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

exports.changePassword = async (req,res)=>{
    try {
        const {token} = req.params;
        
        const {oldPassword ,newPassword, confirmNewPassword} = req.body;
        
        const decodedToken = jwt.verify(token, process.env.secret_key, )
        const userId = decodedToken.userId
    
        const user = await schoolModel.findById(userId)
        if(!user){
            return res.status(404).json({message:'user not found'})
        }
     
        const matchedPassword = await bcrypt.compare(oldPassword, user.password)
        if(!matchedPassword){
             return res.status(400).json({message:'invalid password'})
         }
         if(newPassword !== confirmNewPassword){
            return res.status(400).json({message:'new password does dont match  confirm new password'})
         }
    
         const salt = await bcrypt.genSalt(10)
         const hashedPassword = await bcrypt.hashSync(newPassword, salt)
    
        user.password = hashedPassword
        await user.save()
        return res.status(200).json({message:'changed success'})
    } catch (error) {
       return res.status(error.message) 
    }
    };