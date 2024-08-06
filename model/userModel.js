const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fullName: {
        type: String
    },
    email: {
        type: String,
        // unique: true,
        required: true,
        trim: true
    },
    passWord: {
        type: String
    },
    toDo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "toDo_List"
    }],
    isVerified: {
        type:Boolean,
        default:false
    },
    isAdmin: {
        type:Boolean,
        default:false
    },
    token: {
        type: String
    } 
}, {timestamp: true});


const userModel = mongoose.model("user", userSchema);

module.exports = userModel;

