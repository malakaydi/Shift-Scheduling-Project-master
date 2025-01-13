const mongoose = require('mongoose');

const jobPlanningSchema = new mongoose.Schema({
    employee_name: String,
    position: String,
    startDate: String,
    endDate: String,
    
});

module.exports = mongoose.model('JobPlanning', jobPlanningSchema);
