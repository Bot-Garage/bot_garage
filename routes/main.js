// ===============
// === IMPORTS ===
// ===============
const express = require("express");
const mongoose = require("mongoose");
const routeUtils = require("./_utils.js");



// +-----------+
// |   SETUP   |
// +-----------+

const router = express.Router();





// +------------+
// |   ROUTES   |
// +------------+


// GET: Login
router.get("/login/", async (req, res) => {
    res.render("login");
});


// GET: Register
router.get("/register/", async (req, res) => {
    res.render("register");
});


// GET: Logout Page
router.get("/logout/", async (req, res) => {
    req.session.user = null;
    res.redirect("/login");
});


// GET: Home Page
router.get(["/", "/home/"], routeUtils.auth_check(), async (req, res) => {
    res.render("home");
});

// GET: Profile Page
router.get("/profile/", routeUtils.auth_check(), async (req, res) => {
    res.render("profile");
});

// GET: Email Verification Page
router.get("/verify/:userid/:email_verify_code", async (req, res) => {
    if(!req.params.userid)
        return res.render("error", { message: "Invalid email verification link." });

    if(!req.params.email_verify_code)
        return res.render("error", { message: "Invalid email verification link." });

    // Fail - Invalid User ID
    var db_user;
    try{ db_user = await mongoose.model("USER").findById(req.params.userid).exec() }
    catch(err){ return res.render("error", { message: "Invalid email verification link." }); }
    
    // Fail - Invalid Verify Code
    if(req.params.email_verify_code != db_user.email_verify_code){
        return res.render("error", { message: "Invalid email verification link." });
    }

    // Success
    db_user.email_verified = true;
    return res.redirect("/profile/")
});


// GET: Admin Dashboard
router.get("/admin/", routeUtils.auth_check(), async (req, res) => {
    var users = await mongoose.model("USER").find().sort("name").limit(15).exec();

    res.render("admin", { users: users });
});


// GET: Bots Dashboard
router.get("/bots/", routeUtils.auth_check(), async (req, res) => {
    const db_bots = await mongoose.model("BOT").find({ owner: req.session.user }).collation({locale: "en" }).sort({"name": 1}).exec();
    const db_personalities = await mongoose.model("PERSONALITY").find({ $or: [{ owner: req.session.user }, { system: true }] }).collation({locale: "en" }).sort({"name": 1}).exec();

    res.render("bots", { bots: db_bots, personalities: db_personalities });
});

// GET: Personality
router.get("/personality/", routeUtils.auth_check(), async (req, res) => {
    let db_personalities;
    try{
        db_personalities = await mongoose.model("PERSONALITY").find({ owner: req.session.user }).exec();
    }catch(err){
        res.statusCode = 500;
        return res.render("error", { message: err });
    }

    return res.render("personality", { personalities: db_personalities });
});

// GET: Channels
router.get("/channels/", routeUtils.auth_check(), async (req, res) => {
    // Get channels from database
    var db_channels;
    try{
        db_channels = await mongoose.model("CHANNEL").find({}).exec();
    }catch(err){
        res.render("error", { message: "Router: /get/channels/ - Failed to query channels. Error: " + err });
    }

    return res.render("channels", { channels: db_channels });
});

// GET: Guilds
router.get("/guilds/", routeUtils.auth_check(), async (req, res) => {
    // Get guilds from database
    var db_guilds;
    try{
        db_guilds = await mongoose.model("GUILD").find({}).exec();
    }catch(err){
        res.render("error", { message: "Router: /get/guilds/ - Failed to query guilds. Error: " + err });
    }

    return res.render("guilds", { guilds: db_guilds });
});

// GET: Messages
router.get("/messages/", routeUtils.auth_check(), async (req, res) => {
    // Get messages from database
    var db_messages;
    try{
        db_messages = await mongoose.model("MESSAGE").find().exec();
    }catch(err){
        return res.render("error", { message: "Failed to load messages. Error: " + err });
    }

    // Render page
    res.render("messages", { messages: db_messages });

});





// ==============
// === EXPORT ===
// ==============

module.exports = router;