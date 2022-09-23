const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const logsSchema = new Schema({
    userId: { type: String, required: true },
    targetId: { type: String, required: true },
    action: { type: String, required: true },
}, { timestamps: true });

const Logs = mongoose.model('Logs', logsSchema);

module.exports = function createAndSaveLog(userId, targetId, action) {
    let result = null;
    try {
        result = new Logs({userId, targetId, action}).save();
    } catch (err) {
        console.log(err);
    }
}