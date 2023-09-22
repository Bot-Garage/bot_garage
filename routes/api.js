// +--------------------+
// |   Module Imports   |
// +--------------------+
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const routerUtils = require("./_utils.js");
const botManager = require("../modules/bot_manager.js");


// +-----------+
// |   Setup   |
// +-------/workspaces/ubuntu/source/routes----+
const jsonParser = bodyParser.json();
const router = express.Router();





// +-------------------+
// |   Reply Factory   |
// +-------------------+
class C_Reply{
    constructor(success = false, message = "No message supplied", options = { status_code: 200 }){
        this.success = success;
        this.message = message;
        this.status_code = options.status_code;
    }

    get_reply(){
        return { success: this.success, message: this.message }
    }
};


// +------------------------+
// |   POST: /api/0/user/   |
// +------------------------+
router.post("/user/", routerUtils.api_auth_check(), jsonParser, async (req, res) => {
    // Invalid Username
    const username = req.body.username;
    if(!username || username == ""){
        return res.send({ success: false, message: "Parameter 'username' is non-existant." });
    }

    // Invalid Email Address
    if(!req.body.email_address){
        return res.send({ success: false, message: "Parameter 'email_address' is non-existant." });
    }

    // Invalid Password
    if(!req.body.password){
        return res.send({ success: false, message: "Parameter 'password' is non-existant." });
    }

    var passwordHash = await bcrypt.hash(req.body.password, 10);

    await mongoose.model("USER").create({
        name: username,
        password: passwordHash,
        email: req.body.email_address,
        admin: req.body.admin ? req.body.admin : false
    });

    res.send({ success: true, message: "User created successfully" });
});


// +------------------------+
// |   PATCH /api/0/user/   |
// +------------------------+
router.patch("/user/", routerUtils.api_auth_check(), jsonParser, async (req, res) => {
    console.log(req.body);

    if(!req.body.id){
        return res.send({ success: false, message: "Parameter 'id' is non-existant." });
    }

    // Get user from database
    let db_user;
    try{ db_user = await mongoose.model("USER").findById(req.body.id).exec() }
    catch(err){
        console.error("Failed to find user '" + req.body.id + "' Error: ");
        console.error(err);
        return res.send({ success: false, message: "Failed to find user." });
    }

    // Update Username
    if(req.body.name){
        db_user.name = req.body.name
    }

    // Update Email Address
    if(req.body.email){
        db_user.email = req.body.email
    }

    // Update Password
    if(req.body.password){
        db_user.password = await bcrypt.hash(req.body.password, 10);
    }

    // Save the user information
    try{ db_user.save() }
    catch(err){
        console.error("Failed to save user '" + db_user._id + "' Error: ");
        console.error(error)
        return res.send({ success: false, message: "Failed to save user." });
    }

    // Success
    res.send({ success: true, message: "User information saved successfully." })
});


// +--------------------------+
// |   DELETE: /api/0/user/   |
// +--------------------------+
router.delete("/user/", routerUtils.api_auth_check("admin"), jsonParser, async (req, res) => {
    // Invalid Parameter: id
    const user_id = req.body.id;
    if(!user_id || user_id == ""){
        res.send({ success: false, message: "Parameter 'id' is non-existant." });
        return;
    }

    // Attempt to delete user from database
    try{ 
        await mongoose.model("USER").findByIdAndDelete(user_id);
    }catch(err){ 
        return res.send({ success: false, message: "Failed to find and delete a user with that ID.", user_id: user_id, error: err });
    }

    // Exit - Success
    res.send({ success: true, message: "User has been deleted successfully." });
});


// +-------------------------+
// |   POST: /api/0/login/   |
// +-------------------------+
router.post("/login/", jsonParser, async (req, res) => {
    // Invalid Parameter: Username
    const username = req.body.username;
    if(!username || username == ""){
        res.send({ success: false, message: "Parameter 'username' is non-existant." });
        return;
    }

    // Check if a user exists by that username
    var db_user;
    try {
        db_user = await mongoose.model("USER").findOne({ name_lower: username.toLowerCase() }).exec();
    } catch (error) {
        return res.send({ success: false, message: "Failed to find user with that username" });
    }

    // Invalid Parameter: Password
    const password = req.body.password;

    const passwordMatch = await bcrypt.compare(password, db_user.password);
    if(!passwordMatch){
        res.send({ success: false, message: "Incorrect password." });
        return;
    }

    req.session.user = db_user;
    res.send({ success: true, message: "Login successful." });
});


// +----------------------------+
// |   POST: /api/0/register/   |
// +----------------------------+
router.post("/register/", async (req, res) => {
    // Validation: name
    if(!req.body.name) return res.send({ success: false, message: "Missing parameter: name" });

    // Validation: email_address
    if(!req.body.email_address) return res.send({ success: false, message: "Missing parameter: email_address" });

    // Validation: password
    if(!req.body.password) return res.send({ success: false, message: "Missing parameter: password" });

    // Validation: password_confirmation
    if(!req.body.password) return res.send({ success: false, message: "Missing parameter: 'password_confirmation'" });

    // Validation: Password & Password Confirmation Matching
    if(req.body.password != req.body.password_confirmation) return res.send({ success: false, message: "Password and password confirmation do not match." });

    return res.send({ success: true, message: "Registration Successful." })
});


// +-----------------------+
// |   POST: /api/0/bot/   |
// +-----------------------+
router.post("/bot/", routerUtils.api_auth_check(), jsonParser, async (req, res) => {
    // Invalid Parameter: name
    if(!req.body.name){
        return res.send({ success: false, message: "Missing parameter: 'name'" });
    }

    try{
        await mongoose.model("BOT").create({ name: req.body.name, owner: req.session.user });
    }catch(err){
        console.error("Failed to create a bot. Error: " + err);
        return res.send({ success: false, message: "Failed to create bot" });
    }

    return res.send({ success: true, message: "Bot created successfully." });
});


// +--------------------------+
// |   GET: /api/0/bot/:id/   |
// +--------------------------+
router.get("/bot/:id/", routerUtils.api_auth_check(), async (req, res) => {
    // Invalid Parameter: id
    const botID = req.params.id;
    if(!botID || botID == ""){
        res.send({ success: false, message: "Parameter 'id' is non-existant." });
        return;
    }

    // Check the session data for logged in user to set owner
    try{
        const foundBot = await mongoose.model("BOT").findById(botID).populate("guilds").exec();

        return res.send({ success: true, message: "Bot found successfully.", bot: foundBot });
    }catch{
        return res.send({ success: false, message: "Failed to find the requested bot" })
    }
});


// +-------------------------+
// |   DELETE: /api/0/bot/   |
// +-------------------------+
router.delete("/bot/", routerUtils.api_auth_check(), jsonParser, async (req, res) => {
    // Parameter: Bot ID
    const botID = req.body.bot_id;
    if(!botID || botID == ""){
        return res.send({ success: false, message: "Parameter 'bot_id' is non-existant." });
    }

    try{
        await mongoose.model("BOT").findByIdAndDelete(botID).exec();
        return res.send({ success: true, message: "Bot was deleted successfully.", bot_id: botID });
    }catch{
        return res.send({ success: false, message: "Failed to delete bot.", bot_id: botID });
    }
});


// +-------------------------------+
// |   POST: /api/0/bot/actions/   |
// +-------------------------------+
router.post("/bot/actions/", routerUtils.auth_check(), jsonParser, async (req, res) => {
    if(!req.body.bot_id || req.body.bot_id == ""){
        return res.send({ success: false, message: "Parameter 'bot_id' is non-existant." });
    }

    if(!req.body.action || req.body.action == ""){
        return res.send({ success: false, message: "Parameter 'action' is non-existant." });
    }

    // # Action - Start
    if(req.body.action == "start"){
        // Exit Failure - Failed to start bot
        if(!(await botManager.StartBot(req.body.bot_id)))
            return res.send({ success: false, message: "Failed to start bot." });
        
        // Exit Success - Bot started
        return res.send({ success: true, message: "Bot started." });
    }
    
    // # Action - Stop
    if(req.body.action == "stop"){
        // Exit Failure - Failed to stop bot
        if(!(await botManager.StopBot(req.body.bot_id)))
            return res.send({ success: false, message: "Failed to stop bot." });

        // Exit Success - Bot stopped
        return res.send({ success: true, message: "Bot stopped." });
    }

    // Exit Failure - Unassigned / invalid action.
    return res.send({ success: false, message: "Invalid / missing action" });
});


// +------------------------+
// |   PATCH: /api/0/bot/   |
// +------------------------+
router.patch("/bot/", routerUtils.auth_check(), jsonParser, async (req, res) => {
    // Parameter: Bot ID
    const bot_id = req.body.bot_id;
    if(!bot_id || bot_id == ""){
        return res.send({ success: false, message: "Parameter 'bot_id' is non-existant." });
    }

    // === SETUP - UPDATE_PARAMS ===
    var update_params = {};

    // Optional Parameter: New Bot Name
    const new_name = req.body.new_name;
    if(new_name)
        update_params["name"] = new_name;

    try{
        const found_bot = await mongoose.model("BOT").findById(bot_id);

        if(req.body.name) found_bot.name = req.body.name;
        if(req.body.discord_client_token) found_bot.discord_client_token = req.body.discord_client_token;
        if(req.body.discord_app_id) found_bot.discord_app_id = req.body.discord_app_id;
        if(req.body.openai_api_key) found_bot.openai_api_key = req.body.openai_api_key;
        if(req.body.openai_org_id) found_bot.openai_org_id = req.body.openai_org_id;
        if(req.body.personality) found_bot.personality = req.body.personality;

        await found_bot.save();

        res.send({ success: true, message: "Bot settings were updated successfully.", bot: found_bot });
    }catch(err){
        res.send({ success: false, message: "Error: " + err });
    }
});


// +-------------------------------+
// |   POST: /api/0/personality/   |
// +-------------------------------+
router.post("/personality/", routerUtils.auth_check(), jsonParser, async (req, res) => {
    // Parameter: Name
    if(!req.body.name || req.body.name == ""){
        res.statusCode = 400;
        return res.send({ success: false, message: "Parameter 'name' is non-existant." });
    }

    try{
        const new_personality = await mongoose.model("PERSONALITY").create({ name: req.body.name, owner: req.session.user });
        if(!new_personality){
            return res.send({ success: false, message: "Failed to create personality due to unknown reason." });
        }

        return res.send({ success: true, message: "Personality created.", personality: new_personality });
    }catch(err){
        console.error("API ERROR - POST: /personality/ Error: " + err);
        res.statusCode = 500;
        return res.send({ success: false, message: "Failed to create new personality due to database error.", error: err });
    }
});


// +---------------------------------+
// |   DELETE: /api/0/personality/   |
// +---------------------------------+
router.delete("/personality/", routerUtils.auth_check(), jsonParser, async (req, res) => {
    // Parameter: ID
    if(!req.body.id || req.body.id == ""){
        res.statusCode = 400;
        return res.send({ success: false, message: "Parameter 'id' is non-existant." });
    }

    // Delete personality from database
    var deleted;
    try{
        deleted = await mongoose.model("PERSONALITY").findByIdAndDelete(req.body.id).exec();
    }catch(err){
        console.error(err);
        return res.send({ success: false, message: "Failed to delete personality due to database issue.", error: err });
    }

    // Exit - Failure to delete from database
    if(!deleted)
        return res.send({ success: false, message: "Failed to delete personality." });

    // Exit - Success
    return res.send({ success: true, message: "Deleted personality successfully." });
});


// +--------------------------------+
// |   PATCH: /api/0/personality/   |
// +--------------------------------+
router.patch("/personality/", routerUtils.auth_check(), jsonParser, async (req, res) => {
    // Parameter: ID
    if(!req.body.id || req.body.id == ""){
        res.statusCode = 400;
        return res.send({ success: false, message: "Parameter 'id' is non-existant." });
    }

    // Get personality from database
    var db_personality;
    try { db_personality = await mongoose.model("PERSONALITY").findById(req.body.id).exec(); }
    catch(err) { return res.send({ success: false, message: "Failed to find a personality with that ID.", error: err }); }
    
    // Buffer Variable - Track changes
    var changed = false;

    // Parameter - Name - Update Database Field
    if(req.body.name && req.body.name != ""){
        db_personality.name = req.body.name;
        changed = true;
    }

    // Parameter - Content - Update Database Field
    if(req.body.content && req.body.content != ""){
        db_personality.content = req.body.content;
        changed = true;
    }

    // Nothing changed - Return error
    if(!changed){
        res.send({ success: false, message: "Invalid Request - Nothing provided to update." })
    }

    // Save object back to database.
    try { db_personality.save(); }
    catch(err) { return res.send({ success: false, message: "Failed to save personality, please try again later.", error: err }); }

    res.send({ success: true, message: "Personality has been saved." });
});




// ==============
// === EXPORT ===
// ==============
module.exports = router;