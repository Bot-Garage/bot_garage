// +--------------------+
// |   Module Imports   |
// +--------------------+
const mongoose = require("mongoose");



// +------------------+
// |   Guild Schema   |
// +------------------+
const GuildSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});



// +---------------------------------------------+
// |   Schema Static Function - findFromDiscord   |
// +---------------------------------------------+
GuildSchema.statics.findFromDiscord = async function(discordObj){
    const guild_obj = await mongoose.model("GUILD").findOne({ id: discordObj.id });

    if(!guild_obj)
        return await mongoose.model("GUILD").create({ id: discordObj.id, name: discordObj.name });
    
    return guild_obj;
}



// +-----------------+
// |   Guild Model   |
// +-----------------+
const GuildModel = mongoose.model("GUILD", GuildSchema);



// +--------------------+
// |   Module Exports   |
// +--------------------+
module.exports = GuildModel;