const mongoose = require("mongoose");

const contentSchema = new mongoose.Schema({
    title: {
        type: String
    },
    content: {
        type: String
    },
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }]
});

const contentModel = mongoose.model("toDo_List", contentSchema);

module.exports = contentModel;