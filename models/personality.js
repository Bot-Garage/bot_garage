// +--------------------+
// |   Module Imports   |
// +--------------------+
const mongoose = require("mongoose");



// +------------------------+
// |   Personality Schema   |
// +------------------------+
const PersonalitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "USER",
        required: true,
        unique: false
    },
    content: {
        type: String,
        required: false,
        unqiue: false
    },
    system: {
        type: Boolean,
        required: true,
        unqiue: false,
        default: false
    }
});



// +-----------------------+
// |   Personality Model   |
// +-----------------------+
const PersonalityModel = mongoose.model("PERSONALITY", PersonalitySchema);



// +--------------------+
// |   Module Exports   |
// +--------------------+
module.exports = PersonalityModel;