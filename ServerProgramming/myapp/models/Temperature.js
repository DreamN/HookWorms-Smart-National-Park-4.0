var mongoose = require('mongoose');

var TemperatureSchema = new mongoose.Schema({
    teamID: String,
    sensID: String,
    val: String,
    date: {type: Date}
});

module.exports = mongoose.model('Temperature', TemperatureSchema);
