// +--------------------+
// |   Module Imports   |
// +--------------------+
const mongoose = require("mongoose");
const util = require("util");
const discordjs = require("discord.js");
const OpenAI = require("./openai.js");


// +------------------+
// |   Class: C_Bot   |
// +------------------+
class C_Bot{
    // +-----------------------------------------+
    // |   Function: C_Bot:constructor(bot_id)   |
    // +-----------------------------------------+
    constructor(bot_id){
        const pbot = this;
        this.bot_id = bot_id;
        async() => {
            if(!pbot.bot_id) throw new Error("C_Bot:constructor(bot_id) Missing parameter 'bot_id'.");
    
            // Create Client
            await pbot.create_client();
    
            // Update OpenAI
            await pbot.update_openai();
            
            // Start
            await pbot.start();
        }
    }


    // +-------------------------------------+
    // |   Function: C_Bot:update_openai()   |
    // +-------------------------------------+
    async update_openai(){
        if(this.openai){
            delete this.openai;
            this.openai = null;
        }

        var openai_api_key = "";
        var openai_org_id = "";

        try{
            const db_bot = await mongoose.model("BOT").findById(this.bot_id).exec();

            openai_api_key = db_bot.openai_api_key;
            openai_org_id = db_bot.openai_org_id;

        }catch(err){
            console.error("C_Bot:update_openai() - failed, error: " + err);
            return false;
        }

        if(!openai_api_key){
            console.error("Failed to set up bot '" + this.bot_id + "' because openai_api_key is missing.");
            return false;
        }

        if(!openai_org_id){
            console.error("Failed to set up bot '" + this.bot_id + "' because openai_org_id is missing.");
            return false;
        }

        this.openai = new OpenAI(openai_api_key, openai_org_id);
    }


    // +-------------------------------------+
    // |   Function: C_Bot:create_client()   |
    // +-------------------------------------+
    async create_client(){
        const pBot = this;
        
        if(pBot.discord_client)
            this.stop();

        // Create Discord Client
        pBot.discord_client = new discordjs.Client({
            intents: [
                discordjs.GatewayIntentBits.Guilds,
                discordjs.GatewayIntentBits.GuildMembers,
                discordjs.GatewayIntentBits.GuildMessages,
                discordjs.GatewayIntentBits.GuildPresences,
                discordjs.GatewayIntentBits.MessageContent,
                discordjs.GatewayIntentBits.GuildMessageTyping,
                discordjs.GatewayIntentBits.GuildMessageReactions,
                discordjs.GatewayIntentBits.GuildEmojisAndStickers,
            ]
        });



        pBot.discord_client.on("messageCreate", async function(message){
            // +--------------------+
            // |   Message Memory   |
            // +--------------------+
            try{
                await mongoose.model("MESSAGE").createFromDiscord(message);
            }catch(err){
                console.error("C_Bot:create_client() Failed to save message, error: " + err);
            }

            // +--------------------+
            // |   Prerequisites    |
            // +--------------------+
            if(message.author.bot) return;

            if(!message.mentions.users.get(pBot.discord_client.user.id)) return;



            // +-----------------+
            // |   Personality   |
            // +-----------------+
            var personality = "";
            try{
                const this_bot = await mongoose.model("BOT").findById(pBot.bot_id).populate("personality").exec();
                
                if(this_bot && this_bot.personality && this_bot.personality.content){
                    personality = this_bot.personality.content;
                }else{
                    return;
                }
            }catch(err){
                return;
            }



            // +---------------------------+
            // |   Personality Variables   |
            // +---------------------------+
            personality = personality.replace("{{guild_name}}", message.guild.name);
            personality = personality.replace("{{channel_name}}", message.channel.name);



            // +--------------------+
            // |   Generate Reply   |
            // +--------------------+

            // Prerequisites 
            await pBot.update_openai();
            if(!pBot.openai || !pBot.openai.ChatCompletion){
                console.log("C_Bot:create_client() Failed to create OpenAI Client.");
                return;
            }

            // Have the bot start "typing" in the channel while the message is generated
            message.channel.sendTyping();

            // Generate a reply from OpenAI
            var messages = [{
                role: "system",
                content: [{
                    type: "text",
                    text: personality
                }]
            }];

            // Create User Message Contents
            var user_message = {
                role: "user",
                content: [{
                    type: "text",
                    text: message.content
                }]
            }
            
            // Deal with attachments
            if(message.attachments){
                message.attachments.forEach((attachment) => {
                    if(attachment.url){
                        user_message.content.push({
                            type: "image_url",
                            image_url: {
                                url: attachment.url
                            }
                        }
                    )}
                });
            }

            // User Message
            messages.push(user_message);

            console.log("SEND MESSAGE: ");
            console.log(util.inspect(messages, false, null, true));



            // API Request
            var openai_reply;
            try{
                openai_reply = await pBot.openai.ChatCompletion({ messages });
            }catch(err){
                console.error("Failed to get OpenAI Reply, Error:");
                console.error(err);
                return;
            }
            
            
            // +-----------+
            // |   Reply   |
            // +-----------+
            const reply_msg = openai_reply.choices[0].message.content;
            console.log("RAW REPLY:")
            console.log(util.inspect(openai_reply, false, null, true));
            
            if(!reply_msg) return message.reply("I have a headache.");
            message.reply(reply_msg);
        });



        pBot.discord_client.on("ready", async function(client){
            // Fatch the guilds the bot is in
            const guilds = client.guilds.cache;

            // Update database guilds from database
            var bot_guilds = [];

            // Get guild objects from database
            try{
                guilds.forEach(async function(guild){
                    const db_guild = await mongoose.model("GUILD").findFromDiscord(guild);
                    if(db_guild){
                        bot_guilds.push(db_guild);
                    }
                });
            }catch(err){
                return console.log("Failed to query database. Error: " + err);
            }

            // Get bot, assign guilds, and save.
            try{
                const db_bot = await mongoose.model("BOT").findById(pBot.bot_id).exec();
    
                // Fail - couldn't find bot.
                if(!db_bot) return

                db_bot.guilds = bot_guilds;
                db_bot.save();
            }catch(err){
                console.log("Failed to update bots guilds, error: " + err);
            }

            console.log("Bot '" + client.user.username + "' started.");
        });
    }


    // +-----------------------------+
    // |   Function: C_Bot:start()   |
    // +-----------------------------+
    async start(){
        // Get bot information from database
        var bot_db;
        try{
            bot_db = await mongoose.model("BOT").findById(this.bot_id).exec()
        }
        catch(err){
            console.error("C_Bot:start() Failed: " + err);
            return false;
        }

        if(!bot_db){ return false };


        // Validation: bot.discord_client_token
        if(!bot_db.discord_client_token){
            bot_db.started = false;
            bot_db.stopped = true;

            await bot_db.save();
            console.error("Failed to start bot '" + bot_db.id + "' because 'discord_client_token' is invalid.")
            return false;
        }

        // Discord Client - Create
        this.create_client();

        // Discord Client - Login
        try{
            await this.discord_client.login(bot_db.discord_client_token);
        }catch(err){
            bot_db.started = false;
            bot_db.stopped = true;
            await bot_db.save();
            
            return false;
        }

        // Exit - Success
        bot_db.started = true;
        bot_db.stopped = false;
        await bot_db.save();
        return true;
    }


    // +----------------------------+
    // |   Function: C_Bot:stop()   |
    // +----------------------------+
    async stop(){
        // Destroy connection
        if(this.discord_client){
            await this.discord_client.destroy();
        }

        // Delete Object
        delete this.discord_client;

        // Null Client
        this.discord_client = null;

        // Update database
        try{
            const bot_db_info = await Bot.findById(this.bot_id).exec();
            bot_db_info.started = false;
            await bot_db_info.save();
        }catch{ 
            return false;
        }

        return true;
    }
}



// +-------------------------+
// |   Class: C_BotManager   |
// +-------------------------+
class C_BotManager {
    // +-------------------------------------------+
    // |   Function - C_BotManager:constructor()   |
    // +-------------------------------------------+
    constructor(){
        this.bots = [];
    }


    // +--------------------------------------+
    // |   Function - C_BotManager:GetBot()   |
    // +--------------------------------------+
    async GetBot(bot_id){
        var ret = null;

        for(const bot of this.bots){
            if(bot.bot_id == bot_id){
                ret = bot;
            }
        }

        // Bot doesn't exist - create;
        if(ret == null){
            ret = new C_Bot(bot_id)
            this.bots.push(ret);
        }

        return ret;
    }


    // +------------------------------------------+
    // |   Function - C_BotManager:DeleteBots()   |
    // +------------------------------------------+
    DeleteBots(){
        this.bots = [];
        return true;
    }


    // +------------------------------------------+
    // |   Function - C_BotManager:UpdateBots()   |
    // +------------------------------------------+
    async UpdateBots(){
        // Check that there is a valid database connection
        if(!mongoose.connection.readyState == 1){
            console.error("C_BotManager:UpdateBots() - Mongoose not started, exiting...");
            return false;
        }

        try{
            // Gets bots from database
            const db_bots = await mongoose.model("BOT").find({}).exec();
            if(!db_bots) return false;

            // Update each bot
            this.DeleteBots();

            // Attempt to start each bot
            for(const bot of db_bots){
                // Don't start bots that have been stopped
                if(bot.stopped){
                    bot.started = false;
                    bot.save();
                    return console.log("C_BotManager:UpdateBots() - Skipping stopped bot " + bot.name + " - " + bot.id);
                }
                
                // Start the bot
                console.log("C_BotManager:UpdateBots() - Starting " + bot.name + " - " + bot.id);
                this.StartBot(bot._id);
            }
        }catch(err){
            console.error("C_BotManager:UpdateBots() - Failed to fetch bots. Error: " + err);
            return false;
        }
        return true;
    }


    // +----------------------------------------+
    // |   Function - C_BotManager:StartBot()   |
    // +----------------------------------------+
    async StartBot(bot_id){
        // Attempt to find the bot
        const thisbot = await this.GetBot(bot_id);

        // Exit Failure - Invalid Bot
        if(thisbot == null)
            return false;

        // Exit - Start the bot - Return results
        return thisbot.start();
    }


    // +---------------------------------------+
    // |   Function - C_BotManager:StopBot()   |
    // +---------------------------------------+
    async StopBot(bot_id){
        // Attempt to find the bot
        const thisbot = await this.GetBot(bot_id);

        // Exit Failure - Invalid Bot
        if(thisbot == null)
            return false;

        // Exit - Stop the bot - Return results
        return thisbot.stop();
    }
}



// +--------------------+
// |   Module Exports   |
// +--------------------+
const BotManager = new C_BotManager();

module.exports = BotManager;