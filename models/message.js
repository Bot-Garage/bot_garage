// +--------------------+
// |   Module Imports   |
// +--------------------+
const mongoose = require("mongoose");



// +--------------------+
// |   Message Schema   |
// +--------------------+
const MessageSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GUILD",
        required: true
    },
    guild: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "GUILD",
        required: true
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CHANNEL",
        required: true
    },
    content: {
        type: String,
        required: true
    }
});



// +---------------------------------------------+
// |   Schema Static Function - findFromDiscord   |
// +---------------------------------------------+
MessageSchema.statics.createFromDiscord = async function (discordObj) {
    const message_author = await mongoose.model("AUTHOR").findFromDiscord(discordObj.author);
    const message_guild = await mongoose.model("GUILD").findFromDiscord(discordObj.guild);
    const message_channel = await mongoose.model("CHANNEL").findFromDiscord(discordObj.channel);
    const message_content = discordObj.content;


    return await mongoose.model("MESSAGE").create({ author: message_author, guild: message_guild, channel: message_channel, content: message_content });
}



// +-------------------+
// |   Message Model   |
// +-------------------+
const MessageModel = new mongoose.model("MESSAGE", MessageSchema);



// +-------------+
// |   Exports   |
// +-------------+
module.exports = MessageModel;