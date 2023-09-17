// +--------------------+
// |   Module Imports   |
// +--------------------+
const mongoose = require("mongoose");



// +--------------------+
// |   Channel Schema   |
// +--------------------+
const ChannelSchema = new mongoose.Schema({
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
ChannelSchema.statics.findFromDiscord = async function(discordObj){
    const channel_obj = await mongoose.model("CHANNEL").findOne({ id: discordObj.id });

    if(channel_obj && channel_obj != null)
        return channel_obj

    return await mongoose.model("CHANNEL").create({ id: discordObj.id, name: discordObj.name });
}



// +-------------------+
// |   Channel Model   |
// +-------------------+
const ChannelModel = mongoose.model("CHANNEL", ChannelSchema);



// +--------------------+
// |   Module Exports   |
// +--------------------+
module.exports = ChannelModel;