const userModel = require("../model/userModel");
const contentModel = require("../model/contentModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {welcomeEmail} = require("../helpers/emailTemplates");
const sendMail = require("../helpers/email");
const fs = require("fs");
const path = require("path");


exports.createUser = async (req, res) => {
    try {
        // const {fullName, email, passWord} = req.body;

        // const id = req.params.id;
        // const toDo = await contentModel.findById(id);

        // const newUser = new userModel(req.body);

        // const bcryptPassword = await bcrypt.genSaltSync(10);
        // const hashedPassword = await bcrypt.hashSync(passWord, bcryptPassword);

        // const data = {
        //     fullName,
        //     email: email.toLowerCase(),
        //     passWord: hashedPassword,
        //     toDo
        // };

        // newUser.toDo = toDo;
        // await newUser.save();

        // toDo.toDoInfo.push(newUser);
        // await toDo.save();

        // const newerUser = await userModel.create(data);

        // const loginToken = jwt.sign({
        //     id: newerUser._id, email: newerUser.email},
        //     process.env.jwtSecret,
        //     {expiresIn: "3 minutes"}
        // );
        // const loginLink = `${req.protocol}://${req.get("host")}/api/v1/login/${newerUser._id}/${loginToken}`;
        
        // sendMail({
        //     subject: `Kindly verify your mail.`,
        //     email: newerUser.email,
        //     html: welcomeEmail(loginLink, newerUser.userModel)
        // });

        // res.status(201).json({
        //     message: `Welcome ${newerUser.fullName}, kindly check your email to access the link to log in.`,
        //     data: newerUser
        // });
        const {fullName, email, passWord, toDo, token} = req.body;
       
        const emailExist = await userModel.findOne({email}); 
        if(emailExist) {
            return res.status(400).json({
                error: "This email account already exists."
            })
        }

        const bcryptPassword = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(passWord, bcryptPassword);

        const data = {
            fullName,
            email: email.toLowerCase(),
            passWord: hashedPassword,
            toDo,
            token
        };

        const newUser = await userModel.create(data);
       
        const userToken = jwt.sign(
            {id: newUser._id, email: newUser.email},
            process.env.jwtSecret,
            {expiresIn: "3m"}
        );

        const verifyLink = `${req.protocol}://${req.get('host')}/api/v1/login/${newUser._id}/${userToken}`;
        
        sendMail({
            subject: "Kindly verify your mail.",
            email: newUser.email,
            html: welcomeEmail(verifyLink, newUser)
        });

        res.status(201).json({
            message: `Welcome ${newUser.fullName}, kindly check your email to access the link to log in.`,
            data: newUser
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const user = await userModel.find();
        const allUsers = user.length;

        if(allUsers < 1) {
            res.status(404).json(`No user was found.`)
        } else {
            res.status(200).json({
                message: `These are the number of users available.`,
                allUsers,
                data: user
            })
        }

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

exports.getAUser = async (req, res) => {
    try {
        const oneUser = await userModel.findById(req.params.id).populate("toDo");
        const totalUsers = oneUser.toDo.length;
        res.status(200).json({
            message: `The user with the ID: ${oneUser.id} has been found. They are ${totalUsers} in number.`,
            totalUsers,
            data: oneUser 
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

exports.deleteAUser = async (req, res) => {
    try {
        const id = req.params.id;
        const deleteUser = await userModel.findByIdAndDelete(id);

        if(!deleteUser) {
            res.status(404).json({
                message: "The user was not found."
            })
        } else {
            res.status(201).json({
                message: "This user has successfully been deleted."
            })
        }

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

exports.logIn = async (req, res) => {
    try {
        const {email, passWord} = req.body;
        
        const findUser = await userModel.findOne({
            $or: [{fullName: email}, {email: email.toLowerCase()}]
        });

        if (!findUser) {
            return res.status(404).json({
                message: 'The user with this email does not exist.'
            });
        }

        const matchPassword = await bcrypt.compare(passWord, findUser.passWord);
        
        if (!matchPassword) {
            return res.status(400).json({
                message: 'Invalid password.'
            });
        }

        if (findUser.isVerified === false) {
            return res.status(400).json({
                message: 'The user with this email is not verified.'
            });
        }

        findUser.isLoggedIn = true;

        const user = jwt.sign({
            fullName: findUser.fullName,
            email: findUser.email,
            userId: findUser._id
        }, process.env.jwtSecret, {expiresIn: "1d"});

        const {isVerified, createdAt, updatedAt, __v, ...others} = findUser._doc;

        return res.status(200).json({
            message: 'Logged in successfully.',
            data: others,
            token: user
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const Id = req.params.id
        const findUser = await userModel.findById(Id);

        jwt.verify(req.params.token, process.env.jwtSecret, (err) => {
            if(err) {

                const link = `${req.protocol}://${req.get("host")}/api/v1/newLink/${verify._id}`;
                sendMail({
                    subject: `Kindly verify your mail.`,
                    email: findUser.email,
                    html: welcomeEmail(link, findUser.fullName)
                });

            } else {
                if(findUser.isVerified == true) {
                    return res.status(400).json(`Your account has already been verified.`)
                };

                userModel.findByIdAndUpdate(Id, {isVerified: true});
        
                res.status(200).json({
                    message: `You have been verified, kindly go ahead and log in.`})
            }
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    };
};

exports.reverifyEmail = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);
        const userToken = jwt.sign({id:createdUser._id, email:createdUser.email}, process.env.jwtSecret, {expiresIn: "3 minutes"});
        const reverifyLink = `${req.protocol}://${req.get("host")}/api/v1/verify/${user._id}/${userToken}`;
        const link = sendMail({
            subject: `Kindly re-verify your mail.`,
            email: user.email,
            html: welcomeEmail(reverifyLink, user.firstName)
        })

    } catch (error) {
        res.status(500).json({
            message: error.message
        })  
    }
};
