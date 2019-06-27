const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const eventService = require('../events/event.service');

// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/', getAllUsers);
router.get('/current', getCurrentUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', _deleteUser);
router.post('/createEvent', createEvent);
router.post('/deleteEvent/:id', deleteEvent);
router.get('/events', getEventsForCurrentUser);
router.get('/eventData/:id', getEventData);
router.put('/updateEvent/:id', updateEvent);

module.exports = router;

function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
        .catch(err => next(err));
}

function register(req, res, next) {
    userService.create(req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getAllUsers(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}

function getCurrentUser(req, res, next) {
    userService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getUserById(req, res, next) {
    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function updateUser(req, res, next) {
    userService.updateUserContent(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function _deleteUser(req, res, next) {
    userService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function createEvent(req, res, next) {
    var createdBy = req.user.sub;

    eventService.create(createdBy, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));

    eventService.getAll().then(function (res) {
        var allEvents = res;
        var events = [];
        for (var i = 0; i < allEvents.length; i++) {
            if (allEvents[i].createdBy == createdBy) {
                events.push(allEvents[i].id);
            }
        }
        var updateEventData = { events: events };
        userService.updateUserContent(req.user.sub, updateEventData, "eventUpdate")
            .then(() => res.json({}))
            .catch(err => next(err));

    });

    //user => user ? res.json(user) : res.sendStatus(404)


    /* userService.update(req.params.id, req.body)
    .then(() => res.json({}))
    .catch(err => next(err)); */
}

function deleteEvent(req, res, next) {
    eventServive.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function getEventsForCurrentUser(req, res, next) {
    userService.getById(req.user.sub)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}

function getEventData(req, res, next) {
}

function updateEvent(req, res, next) {
}
