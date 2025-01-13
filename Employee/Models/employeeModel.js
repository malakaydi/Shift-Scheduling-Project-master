const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    phoneNumber: Number,
    email: String,
    position: String,
    
});
module.exports = mongoose.model('Employee', employeeSchema);
