const User = require("../models/user.js");

function auth_check(){
    return async function(req, res, next){
        // Failure: User doesn't exist in session
        if(!req.session.user || !req.session.user._id){
            req.session.user = null;
            return res.redirect("/login/");
        }
        
        // Failure: User not found in database
        var foundUser = await User.findById(req.session.user._id).exec();
        if(!foundUser){
            req.session.user = null;
            return res.redirect("/login/");
        }

        // Success
        req.session.user = foundUser;
        next();
    }
}

function api_auth_check(){
    return async function(req, res, next){
        // Failure: User doesn't exist in session
        if(!req.session.user || !req.session.user._id){
            req.session.user = null;
            return res.send({ success: false, message: "Authentication failed - not logged in" });
        }
        
        // Failure: User not found in database
        var foundUser = await User.findById(req.session.user._id).exec();
        if(!foundUser){
            req.session.user = null;
            return res.send({ success: false, message: "Authentication failed - invalid authentication attempt" });
        }

        // Success
        req.session.user = foundUser;
        next();
    }
}

module.exports.auth_check = auth_check;
module.exports.api_auth_check = api_auth_check;