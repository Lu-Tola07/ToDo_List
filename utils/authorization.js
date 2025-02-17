require("dotenv").config();
const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel");

exports.authorize = async (req, res, next) => {
    try {
        
        const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

        // console.log(token)
        if(!token) {
            return res.status(400).json("Something went wrong, incorrect token.")
        }

        await jwt.verify(token, process.env.jwtSecret, (err, user) => {
            if(err) {
                return res.status(400).json("Kindly login to perform this action.")
            }

            req.user = user._id;
        })

        const checkUser = await userModel.findById(req.user);
        // console.log(checkUser);
        if(checkUser.isAdmin == false) {
            res.status(401).json("You are not allowed to perform this action.")
        } else {
            next()
        }

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};
