const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    eventName: { type: String, unique: true, required: true },
    eventType: { type: String, required: true },
    createdDate: { type: Date, default: Date.now },
    createdBy: { type: String },
    members: []
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Event', schema);