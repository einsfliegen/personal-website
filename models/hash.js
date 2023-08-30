const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hashSchema = new Schema({
    hash : String,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model("Hash", hashSchema);