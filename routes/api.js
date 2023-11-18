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



// +------------------+
// |   /api/0/user/   |
// +------------------+
router.all("/user/", routerUtils.api_auth_check(), jsonParser, async (req, res) => {
    const method = req.method;
    const { id, username, email_address, password } = req.body;

    if (method == "POST") {
        if (!username) return res.status(400).send({ success: false, message: "Parameter 'username' is non-existant." });
        if (!email_address) return res.status(400).send({ success: false, message: "Parameter 'email_address' is non-existant." });
        if (!password) return res.status(400).send({ success: false, message: "Parameter 'password' is non-existant." });

        try {
            await mongoose.model("USER").create({
                name: username,
                password: await bcrypt.hash(req.body.password, 10),
                email: req.body.email_address,
                admin: req.body.admin ? req.body.admin : false
            });

            return res.send({ success: true, message: "User created successfully" });
        } catch {
            return res.status(500).send({ success: false, message: "Internal Server Error." });
        }
    } else if (method == "PATCH") {
        if (!id) return res.status(400).send({ success: false, message: "Parameter 'id' is non-existant." });

        try {
            const db_user = await mongoose.model("USER").findById(id).exec();

            if (req.body.name) db_user.name = req.body.name
            if (req.body.email) db_user.email = req.body.email
            if (req.body.password) db_user.password = await bcrypt.hash(req.body.password, 10);

            await db_user.save();

            return res.send({ success: true, message: "User saved successfully." })
        } catch {
            return res.status(500).send({ success: false, message: "Internal Server Error." });
        }
    } else if (method == "DELETE") {
        router.delete("/user/", routerUtils.api_auth_check("admin"), jsonParser, async (req, res) => {
            if (!id) return res.status(400).send({ success: false, message: "Parameter 'id' is non-existant." });

            try {
                const response = await mongoose.model("USER").findByIdAndDelete(id);
                if (!response)
                    return res.status(500).send({ success: false, message: "Internal Server Error. Failed to delete user." });

                return res.send({ success: true, message: "User deleted successfully." });
            } catch {
                return res.status(500).send({ success: false, message: "Internal Server Error." });
            }
        });
    } else {
        return res.status("405").send({ success: false, message: "Method Not Allowed" });
    }
});


// +------------------------------------------------------+
// |   POST: /api/0/user/regen_email_verification_code/   |
// +------------------------------------------------------+
router.post("/user/regen_email_verification_code/", routerUtils.api_auth_check("admin"), jsonParser, async (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).send({ success: false, message: "Parameter 'id' is non-existant." });

    try {
        const db_user = await mongoose.model("USER").findById(req.body.id).exec();

        db_user.email_verify_code = db_user.GenVerifyCode();
        db_user.email_verified = false;
        db_user.save();

        routerUtils.SendVerifyEmail(db_user.email, db_user._id, db_user.email_verify_code);

        return res.send({ success: true, message: "New verification email has been sent." })
    } catch (error) {
        console.error("/api/0/user/regen_email_verification_code/ ERROR:");
        console.error(error);
        return res.status(500).send({ success: false, message: "Internal Server Error." });
    }
});


// +-------------------------+
// |   POST: /api/0/login/   |
// +-------------------------+
router.post("/login/", jsonParser, async (req, res) => {
    const { username, password } = req.body;
    if (!username) return res.status(400).send({ success: false, message: "Parameter 'username' is non-existant." });
    if (!password) return res.status(400).send({ success: false, message: "Parameter 'password' is non-existant." });
    username("")

    try {
        const db_user = await mongoose.model("USER").findOne({ name_lower: req.body.username.toLowerCase() }).exec();

        // Check the supplied password vs the password hash.
        if (!await bcrypt.compare(req.body.password, db_user.password))
            return res.send({ success: false, message: "Incorrect password." });

        req.session.user = db_user;

        return res.send({ success: true, message: "Login successful." });
    } catch {
        return res.status(500).send({ success: false, message: "Internal Server Error." });
    }
});


// +----------------------------+
// |   POST: /api/0/register/   |
// +----------------------------+
router.post("/register/", async (req, res) => {
    const { name, email_address, password, password_confirmation } = req.body;
    if (!name) return res.status(400).send({ success: false, message: "Parameter 'name' is non-existant." });
    if (!email_address) return res.status(400).send({ success: false, message: "Parameter 'email_address' is non-existant." });
    if (!password) return res.status(400).send({ success: false, message: "Parameter 'password' is non-existant." });
    if (!password_confirmation) return res.status(400).send({ success: false, message: "Parameter 'password_confirmation' is non-existant." });

    try {
        const new_user = mongoose.model("USER").create({ name: name, email_address: email_address, password: await bcrypt.hash(password, 10) });
        if (!new_user) return res.send({ success: false, message: "Failed to create user." });

        return res.send({ success: true, message: "Registration Successful." })
    } catch {
        return res.status(500).send({ success: false, message: "Internal Server Error." });
    }
});


// +-------------------------------+
// |   POST: /api/0/bot/actions/   |
// +-------------------------------+
router.post("/bot/actions/", routerUtils.api_auth_check(), jsonParser, async (req, res) => {
    const { id, action } = req.body;
    if (!id) return res.status(400).send({ success: false, message: "Parameter 'id' is non-existant." });
    if (!action) return res.status(400).send({ success: false, message: "Parameter 'action' is non-existant." });

    if (action == "start") {
        if (await botManager.StartBot(id) == false)
            return res.send({ success: false, message: "Failed to start bot." });

        return res.send({ success: true, message: "Bot started." });
    }

    if (action == "stop") {
        if (await botManager.StopBot(id) == false)
            return res.send({ success: false, message: "Failed to stop bot." });

        return res.send({ success: true, message: "Bot stopped." });
    }

    return res.send({ success: false, message: "Invalid / missing action" });
});


router.all(["/bot/", "/bot/:id/"], routerUtils.api_auth_check(), jsonParser, async (req, res) => {
    const method = req.method;
    const { id, name, discord_client_token, discord_app_id, openai_api_key, openai_org_id, personality } = (req.method == "GET" ? req.params : req.body);

    // +----------------------+
    // |   GET: /api/0/bot/   |
    // +----------------------+
    if (method == "GET") {
        if (!id) return res.status(400).send({ success: false, message: "Parameter 'id' is non-existant." });

        try {
            const db_bot = await mongoose.model("BOT").findById(id).populate("guilds").exec();
            if (!db_bot) {
                return res.status()
            }

            return res.send({ success: true, message: "Bot found successfully.", bot: db_bot });
        } catch (error) {
            console.error("GET: /api/0/bot/ ERROR: ");
            console.error(error);
            return res.status(500).send({ success: false, message: "Internal Server Error." });
        }
    }

    // +-----------------------+
    // |   POST: /api/0/bot/   |
    // +-----------------------+
    else if (method == "POST") {
        if (!name) return res.status(400).send({ success: false, message: "Parameter 'name' is non-existant." });

        try {
            await mongoose.model("BOT").create({ name: name, owner: req.session.user });

            return res.send({ success: true, message: "Bot created successfully." });
        } catch (err) {
            return res.status(500).send({ success: false, message: "Internal Server Error." });
        }
    }

    // +-------------------------+
    // |   DELETE: /api/0/bot/   |
    // +-------------------------+
    else if (method == "DELETE") {
        if (!id) return res.status(400).send({ success: false, message: "Parameter 'id' is non-existant." });

        try {
            await mongoose.model("BOT").findByIdAndDelete(id).exec();
            return res.send({ success: true, message: "Bot was deleted successfully.", bot_id: id });
        } catch (err) {
            console.error("DELETE '/api/0/bot/' FAILED.");
            console.error(err);
            return res.status(500).send({ success: false, message: "Internal Server Error." });
        }
    }

    // +------------------------+
    // |   PATCH: /api/0/bot/   |
    // +------------------------+
    else if (method == "PATCH") {
        if (!id) return res.status(400).send({ success: false, message: "Parameter 'id' is non-existant." });

        try {
            const db_bot = await mongoose.model("BOT").findById(id);

            if (name) db_bot.name = name;
            if (discord_client_token) db_bot.discord_client_token = discord_client_token;
            if (discord_app_id) db_bot.discord_app_id = discord_app_id;
            if (openai_api_key) db_bot.openai_api_key = openai_api_key;
            if (openai_org_id) db_bot.openai_org_id = openai_org_id;
            if (personality) db_bot.personality = personality;

            await db_bot.save();

            return res.send({ success: true, message: "Bot updated successfully.", bot: db_bot });
        } catch (err) {
            return res.status(500).send({ success: false, message: "Internal Server Error." });
        }
    } else {
        return res.status("405").send({ success: false, message: "Method Not Allowed" });
    }
});


router.all("/personality/", routerUtils.api_auth_check(), jsonParser, async (req, res) => {
    const method = req.method;
    const { id, name, content } = (req.method == "GET" ? req.params : req.body);

    if (method == "GET") {

    } else if (method == "POST") {
        if (!name) return res.send({ success: false, message: "Parameter 'name' is non-existant." });

        try {
            const new_personality = await mongoose.model("PERSONALITY").create({ name: name, owner: req.session.user });
            if (!new_personality) {
                return res.send({ success: false, message: "Failed to create personality due to unknown reason." });
            }

            return res.send({ success: true, message: "Personality created.", personality: new_personality });
        } catch (err) {
            return res.status(500).send({ success: false, message: "Internal Server Error." });
        }
    } else if (method == "PATCH") {
        if (!id) return res.status(400).send({ success: false, message: "Parameter 'id' is non-existant." });

        try {
            const db_personality = await mongoose.model("PERSONALITY").findById(id).exec();

            if (name) db_personality.name = name;
            if (content) db_personality.content = content;

            db_personality.save();

            res.send({ success: true, message: "Personality has been saved." });
        } catch (err) {
            res.status(500).send({ success: false, message: "Internal Server Error." });
        }
    } else if (method == "DELETE") {
        if (!id) return res.status(400).send({ success: false, message: "Parameter 'id' is non-existant." });

        try {
            await mongoose.model("PERSONALITY").findByIdAndDelete(id).exec();

            return res.send({ success: true, message: "Deleted personality successfully." });
        } catch (err) {
            res.status(500).send({ success: false, message: "Internal Server Error." });
        }
    }
});


router.all("/logs/", routerUtils.api_auth_check(), jsonParser, async (req, res) => {
    const { id } = (req.method == "GET" ? req.params : req.body);

    if (req.method == "DELETE") {
        if (!id) return res.status(400).send({ success: false, message: "Parameter 'id' is non-existant." });

        if (id == -1) {
            try {
                await mongoose.model("LOG").deleteMany({}).exec();
                return res.send({ success: true, message: "Deleted all logs successfully." });
            } catch (err) {
                return res.status(500).send({ success: false, message: "Internal Server Error." });
            }
        } else {
            try {
                await mongoose.model("LOG").findByIdAndDelete(id).exec();
                return res.send({ success: true, message: "Deleted log successfully." });
            } catch (err) {
                return res.status(500).send({ success: false, message: "Internal Server Error." });
            }
        }
    }
});



// ==============
// === EXPORT ===
// ==============
module.exports = router;