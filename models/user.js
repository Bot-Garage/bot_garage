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
    email_verified: {
        type: Boolean,
        default: false,
        required: true
    },
    email_verify_code: {
        type: String,
        required: false
    },
    admin: {
        type: Boolean,
        required: true,
        default: false,
        unique: false
    }
});



// +---------------------------+
// |   Method: GenVerifyCode   |
// +---------------------------+
userSchema.methods.GenVerifyCode = (cb) => {
    // Generate Code
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-";
    const length = 50;
    var buffer = [];

    for (var i = 0; i <= length; i++) {
        buffer += characters[Math.floor(Math.random() * characters.length)];
    }

    // Return the code
    return buffer;
}


// +---------------+
// |   Save Hook   |
// +---------------+
userSchema.pre("save", function (next) {
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