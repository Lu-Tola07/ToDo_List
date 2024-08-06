const contentModel = require("../model/contentModel");
const userModel = require("../model/userModel");
const {createUser} = require("./userController");

exports.createContent = async (req, res) => {
    try {
        const {title, content} = req.body;

        const id = req.params.id;
        if (!id) {
            return res.status(400).json({
                message: "No ID provided in request body."
            });
        }
        // console.log('Searching for user with ID:', id);
        
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                message: "This user was not found."
            })
        }

        const data = {
            title,
            content,
            user
        };

        const newContent = await contentModel.create(data);
        if (!Array.isArray(user.userInfo)) {
            user.userInfo = []
        }

        user.userInfo.push(newContent);
        await user.save();

        res.status(200).json({
            message: `The content, ${newContent.title} has been created.`,
            data: newContent
        })

    } catch (error) {
        res.status(500).json(error.message)
    }
};

exports.getAContent = async (req, res) => {
    try {
        
        const oneContent = await contentModel.findById(req.params.id).populate("user");
        const totalContent = oneContent.user.length;
        res.status(200).json({
            message: `The content with the ID: ${oneContent.id} has been found. They are ${totalContent} in number.`,
            totalContent,
            data: oneContent 
        })
        // console.log(oneContent.user.length);

    } catch (error) {
        res.status(500).json(error.message)
    }
};

exports.getAllContent = async (req, res) => {
    try {
        
        const content = await contentModel.find();
        const allContent = content.length;

        if(allContent < 1) {
            res.status(404).json(`No content was found.`)
        } else {
            res.status(200).json({
                message: `These are the number of content available.`,
                allContent,
                data: content
            })
        }

    } catch (error) {
        res.status(500).json(error.message)
    }
};

exports.updateAContent = async (req, res) => {
    try {
        const contentId = req.params.id;
        const {title, content, user} = req.body;
        const data = {
            title,
            content,
            user
        }

        const updatedContent = await contentModel.findOneAndUpdate(
            {_id: contentId},
            data,
            {new: true}
        );
        
        if(updatedContent) {
            return res.status(200).json({
                message: `This content has been updated.`,
                data: updatedContent
            })
        }

    } catch (error) {
        res.status(500).json(error.message)
    }
};

exports.deleteAContent = async (req, res) => {
    try {
        
        const id = req.params.id;
        const deleteContent = await contentModel.findByIdAndDelete(id);

        if(!deleteContent) {
            res.status(404).json({
                message: `The content with Id: ${id} was not found.`
            })
        } else {
            res.status(201).json({
                messsage: `This content has successfully been deleted.`
            })
        }

    } catch (error) {
        res.status(500).json(error.message)
    }
};

