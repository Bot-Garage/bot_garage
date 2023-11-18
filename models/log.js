// +--------------------+
// |   Module Imports   |
// +--------------------+
const mongoose = require("mongoose");



// +----------------+
// |   Log Schema   |
// +----------------+
const LogSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    type: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    message: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    bot: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    }
});



LogSchema.statics.LogSystem = async function (message) {
    console.log(message);
    return await mongoose.model("LOG").create({ type: "System", message: message });
}

LogSchema.statics.LogSystemError = async function (message) {
    console.error(message);
    return await mongoose.model("LOG").create({ type: "Error", message: message });
}

LogSchema.statics.LogBot = async function (message, bot_id = null) {
    console.log(message);
    return await mongoose.model("LOG").create({ type: "Bot", message: message, bot_id: bot_id });
}

LogSchema.statics.LogBotError = async function (message, bot_id = null) {
    console.error(message);
    return await mongoose.model("LOG").create({ type: "Bot", message: message, bot_id: bot_id });
}


// +---------------+
// |   Log Model   |
// +---------------+
const LogModel = new mongoose.model("LOG", LogSchema);



// +-------------+
// |   Exports   |
// +-------------+
module.exports = LogModel;