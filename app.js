// +--------------------+
// |   Import Modules   |
// +--------------------+
const express = require("express");
const lessMiddleware = require("less-middleware");
const session = require("express-session");
const mongostore = require("connect-mongo");
const morgan = require("morgan");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");



// +-------------------+
// |   Import Models   |
// +-------------------+
const User = require("./models/user.js");
const Bot = require("./models/bot.js");
const Personality = require("./models/personality.js");
const Message = require("./models/message.js");
const Channel = require("./models/channel.js");
const Guild = require("./models/guild.js");
const Author = require("./models/author.js");



// +--------------------+
// |   Import Routers   |
// +--------------------+
const mainRouter = require("./routes/main.js");
const apiRouter = require("./routes/api.js");
const BotManager = require("./modules/bot_manager");



// +-----------------+
// |   Base Config   |
// +-----------------+
dotenv.config();
global.__basedir = __dirname;

// Database Link Gen
if(process.env.MONGO_DB_URL){
    connect_buffer = process.env.MONGO_DB_URL;
}else if(process.env.DB_HOST){
    process.env.MONGO_DB_URL = "mongodb://" + (process.env.DB_USER ? process.env.DB_USER + (process.env.DB_PASSWORD ? (":" + process.env.DB_PASSWORD) + "@" : "") : "");
    process.env.MONGO_DB_URL += process.env.DB_HOST + ":" + process.env.DB_PORT || 27017 + (process.env.DB_DATABASE ? process.env.DB_DATABASE : "");
}else{
    throw new Error("Missing database connection information")
}



// +-------------------+
// |   Express Setup   |
// +-------------------+
const app = express();
app.set("view engine", "pug");
app.set("views", global.__basedir + "/views");

// Middleware: Morgan Logging
app.use(morgan("dev"));

// Middleware: Sessions
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: "funy passwrd",
    store: mongostore.create({
        mongoUrl: process.env.MONGO_DB_URL
    }),
    cookie: {
        secure: (process.env.NODE_ENV == "production" ? true : false)
    }
}));

// Middleware: Add session information to local variable
app.use(function(req, res, next){
    res.locals.session = req.session;
    next();
});

// Middleware: LESS Compiling
app.use("/public/css/", lessMiddleware(global.__basedir + "/less", {dest: global.__basedir + "/less-compiled"}));

// Middleware - Static File Serving
app.use("/public/", express.static(global.__basedir + "/static"));
app.use("/public/css/", express.static(global.__basedir + "/less-compiled"));

// Router - Main Router
app.use("/", mainRouter);

// Router - API
app.use("/api/0/", apiRouter);



// +------------------------+
// |   Function - Startup   |
// +------------------------+
(async () => {
    console.log("[Startup] Starting...");

    // +---------------------------+
    // |   Database - Connection   |
    // +---------------------------+

    console.log("[Startup - Database] Connecting with the following connection string:");
    console.log("[Startup - Database] " + process.env.MONGO_DB_URL);

    // Mongoose Event - On Connection Open
    mongoose.connection.on("open", function(err){
        console.log("[Startup] Connected to MongoDB Database Successfully.");

        BotManager.UpdateBots();
    });

    // Mongoose Event - On Connection Error
    mongoose.connection.on("error", function(err){
        console.error("[Startup - Database] Failed! Error:");
        console.error(err);
    });

    // Connect to MongoDB Database
    try{
        await mongoose.connect(process.env.MONGO_DB_URL);
    }catch(err){
        console.error("[Startup - Database] Failed to connect to MongoDB Database, error: ");
        console.error(err);
        process.exit()
    }


    // +---------------------------+
    // |   Database - Admin User   |
    // +---------------------------+
    var create_admin = false;
    try{
        const user_count = await User.countDocuments({}).exec();
        if(user_count <= 0){
            create_admin = true;
        }
    }
    catch{
        create_admin = true;
    }

    if(create_admin){
        // Validate: process.env.ADMIN_USER_NAME
        const new_admin_name = process.env.ADMIN_USER_NAME;
        if(!new_admin_name) throw new Error("Enviroment Variable Missing: ADMIN_USER_NAME");

        // Validate: process.env.ADMIN_USER_PASSWORD
        const new_admin_password = process.env.ADMIN_USER_PASSWORD;
        const new_admin_password_hash = await bcrypt.hash(new_admin_password, 10);
        if(!new_admin_password) throw new Error("Enviroment Variable Missing: ADMIN_USER_PASSWORD");

        try{
            await mongoose.model("USER").create({ name: new_admin_name, password: new_admin_password_hash });
        }catch(err){
            throw new Error("Failed to create admin user, Error: \n" + err);
        }
        
        // Verbose
        console.log("[Startup] Admin user '" + new_admin_name + "' with the password '" + new_admin_password + "' has been created.")
    }


    // +----------------------------------+
    // |   Web Server - Start Listening   |
    // +----------------------------------+
    app.listen(8080, function(err){
        if(err) throw err;
        console.log("Started listening at http://0.0.0.0:8080/");
    });
})()