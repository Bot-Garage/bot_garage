// +--------------------+
// |   Module Imports   |
// +--------------------+
const mongoose = require("mongoose");



// +----------------+
// |   Bot Schema   |
// +----------------+
const botSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unqiue: false
    },
    started: {
        type: Boolean,
        required: true,
        default: false,
        unqiue: false
    },
    stopped: {
        type: Boolean,
        required: true,
        default: true,
        unique: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
        required: false,
        unqiue: false
    },
    openai_api_key: {
        type: String,
        required: false,
        unqiue: false
    },
    openai_org_id: {
        type: String,
        required: false,
        unqiue: false
    },
    discord_client_token: {
        type: String,
        required: false,
        unqiue: true
    },
    discord_app_id: {
        type: String,
        required: false,
        unqiue: true
    },
    guilds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "GUILD",
        required: false,
        unique: false
    }],
    personality: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PERSONALITY",
        required: false,
        unique: false
    }
}, { timestamps: true });



// +---------------+
// |   Bot Model   |
// +---------------+
const botModel = mongoose.model("BOT", botSchema);



// +--------------------+
// |   Module Exports   |
// +--------------------+
module.exports = botModel;