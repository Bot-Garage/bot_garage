// +-------------+
// |   Imports   |
// +-------------+
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");



// +-----------------+
// |   User Schema   |
// +-----------------+
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    name_lower: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: false,
        unique: true
    },
    admin: {
        type: Boolean,
        required: true,
        default: false,
        unique: false
    }
});



// +---------------+
// |   Save Hook   |
// +---------------+
userSchema.pre("save", function(next){
    this.name_lower = this.name.toLowerCase();
    next();
});



// +----------------+
// |   User Model   |
// +----------------+
const UserModel = mongoose.model("USER", userSchema);



// +--------------------+
// |   Module Exports   |
// +--------------------+
module.exports = UserModel;