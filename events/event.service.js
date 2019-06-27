const config = require('config.json');
const db = require('_helpers/db');
const Event = db.Event;

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function getAll() {
    return await Event.find().select('-hash');
}

async function getById(id) {
    return await Event.findById(id).select('-hash');
}

async function create(createdBy, eventParam) {

    const event = new Event(eventParam);

    event.createdBy = createdBy;
    await event.save();
}

async function update(id, eventParam) {
    const event = await Event.findById(id);

    // validate
    if (!event) throw 'Event not found';

    // copy userParam properties to user
    Object.assign(event, eventParam);
    await user.save();
}

async function _delete(id) {
    await Event.findByIdAndRemove(id);
}