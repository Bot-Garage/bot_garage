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
    try{
        var db_personalities = await mongoose.model("PERSONALITY").find({ owner: req.session.user }).exec();
        return res.render("personality", { personalities: db_personalities });
    }catch(err){
        return res.render("error", { message: err });
    }
});



// GET: Admin / Users
router.get("/admin/users", routeUtils.auth_check(), async (req, res) => {
    try{
        var db_users = await mongoose.model("USER").find({}).exec();
        return res.render("admin/users", { users: db_users });
    }catch(error){
        return res.render("error", { message: "Internal Server Error. ", error});
    }
});



// GET: Admin / Channels
router.get("/admin/channels/", routeUtils.auth_check(), async (req, res) => {
    try{
        var db_channels = await mongoose.model("CHANNEL").find({}).exec();
        return res.render("admin/channels", { channels: db_channels });
    }catch(err){
        return res.render("error", { message: "Router: /get/channels/ - Failed to query channels. Error: " + err });
    }
});



// GET: Admin / Bots
router.get("/admin/bots/", routeUtils.auth_check(), async (req, res) => {
    try{
        var db_channels = await mongoose.model("CHANNEL").find({}).exec();
        return res.render("admin/bots", { channels: db_channels });
    }catch(err){
        return res.render("error", { message: "Router: /get/channels/ - Failed to query channels. Error: " + err });
    }
});



// GET: Admin / Guilds
router.get("/admin/guilds/", routeUtils.auth_check(), async (req, res) => {
    try{
        var db_guilds = await mongoose.model("GUILD").find({}).exec();
        return res.render("admin/guilds", { guilds: db_guilds });
    }catch(err){
        res.render("error", { message: "Router: /get/guilds/ - Failed to query guilds. Error: " + err });
    }

});



// GET: Admin / Messages
router.get("/admin/messages/", routeUtils.auth_check(), async (req, res) => {
    try{
        var db_messages = await mongoose.model("MESSAGE").find().exec();
        res.render("admin/messages", { messages: db_messages });
    }catch(err){
        return res.render("error", { message: "Failed to load messages. Error: " + err });
    }
});



// GET: Admin / Logs
router.get("/admin/logs/", routeUtils.auth_check(), async (req, res) => {
    try{
        const db_logs = await mongoose.model("LOG").find().limit(100).sort({"date": -1}).exec();
        res.render("admin/logs", { logs: db_logs });
    }catch(err){
        return res.render("error", { message: "Failed to logs. Error: " + err });
    }
});





// ==============
// === EXPORT ===
// ==============

module.exports = router;