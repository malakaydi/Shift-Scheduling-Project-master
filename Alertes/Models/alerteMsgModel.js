const mongoose = require('mongoose');

const alerteMsgSchema = new mongoose.Schema({
    recipient: String,
    message: String,
});

module.exports = mongoose.model('AlerteMsg', alerteMsgSchema);
