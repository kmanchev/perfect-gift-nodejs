const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schema = new Schema({
    eventName: { type: String, unique: true, required: true },
    eventType: { type: String, required: true },
    createdDate: { type: Date, default: Date.now },
    createdBy: { type: String, required: true  },
    members: [{ type: String, ref: 'id' }],
    multimedia: [{
        uploader: { type: String, unique: true, required: true },
        path: { type: String, required: true },
        name: { type: String, required: true }
    }]
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Event', schema);