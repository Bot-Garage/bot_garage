// +--------------------+
// |   Module Imports   |
// +--------------------+
const mongoose = require("mongoose");



// +-------------------+
// |   Author Schema   |
// +-------------------+
var AuthorSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});



// +-------------------------------------------------------+
// |   Function - AuthorModel.findFromDiscord(discordObj)   |
// +-------------------------------------------------------+
AuthorSchema.statics.findFromDiscord = async function(discordObj){
    const author_obj = await mongoose.model("AUTHOR").findOne({ id: discordObj.id });

    if(author_obj && author_obj != null)
        return author_obj

    return await mongoose.model("AUTHOR").create({ id: discordObj.id, name: discordObj.username });
}



// +------------------+
// |   Author Model   |
// +------------------+
const AuthorModel = mongoose.model("AUTHOR", AuthorSchema);



// +--------------------+
// |   Module Exports   |
// +--------------------+
module.exports = AuthorModel;