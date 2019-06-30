const config = require('config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('_helpers/db');
const User = db.User;

module.exports = {
    authenticate,
    getAll,
    getById,
    create,
    updateUserContent,
    getAllEvents,
    delete: _delete
};

async function authenticate({ username, password }) {
    const user = await User.findOne({ username });
    if (user && bcrypt.compareSync(password, user.hash)) {
        const { hash, ...userWithoutHash } = user.toObject();
        const token = jwt.sign({ sub: user.id }, config.secret);
        return {
            ...userWithoutHash,
            token
        };
    }
}

async function getAll() {
    return await User.find().select('-hash');
}

async function getById(id) {
    return await User.findById(id).select('-hash');
}

async function create(userParam) {
    // validate
    if (await User.findOne({ username: userParam.username })) {
        throw 'Username "' + userParam.username + '" is already taken';
    }

    const user = new User(userParam);

    // hash password
    if (userParam.password) {
        user.hash = bcrypt.hashSync(userParam.password, 10);
    }

    // save user
    await user.save();
}

async function updateUserContent(id, data, type) {
    const user = await User.findById(id);

    // validate
    if (!user) throw 'User not found';

    if (type == "eventUpdate") {
        //do some pre-computing if needed . to delete if not needed

    } else {

        if (user.username !== data.username && await User.findOne({ username: data.username })) {
            throw 'Username "' + data.username + '" is already taken';
        }

        // hash password if it was entered
        if (data.password) {
            data.hash = bcrypt.hashSync(data.password, 10);
        }

        if (data.event) {
            data.hash = bcrypt.hashSync(data.password, 10);
        }
    }

    // copy payload properties to user
    Object.assign(user, data);

    await user.save();
}

async function getAllEvents(id) {
    return await User.findById(id).select('events');
}

async function _delete(id) {
    await User.findByIdAndRemove(id);
}