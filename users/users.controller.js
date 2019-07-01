const express = require('express');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart({ uploadDir: './uploads' });
const router = express.Router().all(multipartMiddleware);
const userService = require('./user.service');
const eventService = require('../events/event.service');


// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/', getAllUsers);
router.get('/current', getCurrentUser);
router.get('/events', getEventsForCurrentUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', _deleteUser);
router.post('/createEvent', createEvent);
router.post('/deleteEvent/:id', deleteEvent);
router.get('/eventData/:id', getEventData);
router.put('/updateEvent/:id', updateEvent);
router.post('/upload', multipartMiddleware, uploadData);

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
        .then(function (results1) {
            eventService.getAll().then(function (result2) {
                var allEvents = result2;
                var events = [];
                for (var i = 0; i < allEvents.length; i++) {
                    if (allEvents[i].createdBy == createdBy) {
                        //const event = eventService.getEventObject(allEvents[i]);
                        events.push(allEvents[i]);
                    }
                }
                var updateEventData = { events: events };
                userService.updateUserContent(req.user.sub, updateEventData, "eventUpdate")
                    .then(() => res.json({}))
                    .catch(err => next(err));

            });
            return res.json({})
        })
        .catch(err => next(err));
}

function deleteEvent(req, res, next) {
    eventService.delete(req.params.id)
        .then(() => res.json({}))
        .catch(err => next(err));

    userService.getById(req.user.sub).then(function (res) {
        var usersEvents = res.events;
        var spliceIndex = -1;
        for (var i = 0; i < usersEvents.length; i++) {
            //var event = JSON.parse(usersEvents[i]);
            if (usersEvents[i].id == req.params.id) {
                spliceIndex = i;
                break;
            }
        }
        if (spliceIndex != -1) {
            var removed = usersEvents.splice(spliceIndex, 1);
        }

        var updateEventData = { events: usersEvents };
        userService.updateUserContent(req.user.sub, updateEventData, "eventUpdate")
            .then(() => res.json({}))
            .catch(err => next(err));
    });
}

function getEventsForCurrentUser(req, res, next) {
    userService.getById(req.user.sub)
        .then(function(result) {
            return result ? res.json(result.events) : res.sendStatus(404);
        })
        .catch(err => next(err));
}

//events => events ? res.json(events) : res.sendStatus(404)

function getEventData(req, res, next) {
}

function updateEvent(req, res, next) {
}

function uploadData(req, res, next) {
    res.json({
        'message': 'File uploaded successfully'
    });
}
