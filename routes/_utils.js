const User = require("../models/user.js");

function auth_check(role){
    return async function(req, res, next){
        // Failure: User doesn't exist in session
        if(!req.session.user || !req.session.user._id){
            req.session.user = null;
            return res.redirect("/login/");
        }
        
        // Failure: User not found in database
        var db_user = await User.findById(req.session.user._id).exec();
        if(!db_user){
            req.session.user = null;
            return res.redirect("/login/");
        }

        if(role == "admin" && db_user.admin == false){
            return res.render("error", { message: "Invalid permissions to view this page." });
        }

        // Success
        req.session.user = db_user;
        next();
    }
}

function api_auth_check(role){
    return async function(req, res, next){
        // Failure: User doesn't exist in session
        if(!req.session.user || !req.session.user._id){
            req.session.user = null;
            return res.send({ success: false, message: "Authentication failed - not logged in" });
        }
        
        // Failure: User not found in database
        var db_user = await User.findById(req.session.user._id).exec();
        if(!db_user){
            req.session.user = null;
            return res.send({ success: false, message: "Authentication failed - invalid authentication attempt" });
        }

        if(role == "admin" && db_user.admin == false){
            return res.send({ success: false, message: "You do not have permission to complete this action." })
        }

        // Success
        req.session.user = db_user;
        next();
    }
}

module.exports.auth_check = auth_check;
module.exports.api_auth_check = api_auth_check;