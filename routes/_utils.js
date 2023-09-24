const sendgrid = require("@sendgrid/mail");

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

function api_auth_check(role="user"){
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

        // Check if user is an admin.
        if(role == "admin" && db_user.admin == false){
            return res.code(403).send({ success: false, message: "Access Denied." });
        }

        // Success
        req.session.user = db_user;
        next();
    }
}

function SendVerifyEmail(email_address, user_id, validation_code){
    if(!process.env.SENDGRID_API_KEY) throw new Error("Enviroment Variable Missing: SENDGRID_API_KEY");
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
    
    sendgrid.send({
        from: "noreply@jdlab.xyz",
        to: email_address,
        template_id: "d-a0fb14e96d8b427380abc2bdccf9d4d2",
        dynamic_template_data: { user_id, validation_code }
    });
}

module.exports.auth_check = auth_check;
module.exports.api_auth_check = api_auth_check;
module.exports.SendVerifyEmail = SendVerifyEmail;