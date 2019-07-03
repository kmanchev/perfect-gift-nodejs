const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const imageService = require('../_helpers/image.service');
const eventService = require('../events/event.service');
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');

    },
    filename: function (req, file, cb) {
        cb(null, req.user.sub + "_" + new Date().toISOString() + "_" + file.originalname)
    }

});

const upload = multer({ storage: storage })

// routes
router.post('/authenticate', authenticate);
router.post('/register', register);
router.post('/invite', inviteUser);
router.get('/', getAllUsers);
router.get('/current', getCurrentUser);
router.get('/:id/events', getEventsForCurrentUser);
router.get('/event/:id', getEvent);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', _deleteUser);
router.post('/createEvent', createEvent);
router.post('/deleteEvent/:id', deleteEvent);
router.put('/updateEvent/:id', updateEvent);
router.post('/photoUpload/:eventId', upload.single('productImage'), photoUpload);
router.delete('/deletePhoto/:uploaderId/:eventId/:photoName', deletePhoto);

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

function inviteUser(req, res, next) {
    userService.getAll()
        .then(function (result) {
            console.log(req.body);
            console.log(result);
            return res.json({ message: "no user with that mail" });
        })
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
                        events.push(allEvents[i].id);
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
    eventService.getAll().then(function (result) {
        if (result) {
            var yourEvents = [];
            result.forEach(function (data) {
                if (data.createdBy == req.params.id) {
                    yourEvents.push(data);
                }
            })

            res.json(yourEvents);
        } else {
            return res.sendStatus(404);
        }
    })
        .catch(err => next(err));
}

function getEvent(req, res, next) {
    eventService.getById(req.params.id)
        .then(function (result) {
            return result ? res.json(result) : res.sendStatus(404);
        })
        .catch(err => next(err));
}

function updateEvent(req, res, next) {
    eventService.update(req.params.id, req.body)
        .then(() => res.json({}))
        .catch(err => next(err));
}

function photoUpload(req, res, next) {
    eventService.getById(req.params.eventId).then(function (result) {
        var updatedMultimedia = result.multimedia;
        var multimediaObject = { uploader: req.user.sub, path: req.file.path };
        updatedMultimedia.push(multimediaObject);
        eventService.update(req.params.eventId, { multimedia: updatedMultimedia })
            .then(() => res.json({}))
            .catch(err => next(err));;
    }).catch(err => next(err));
}

function deletePhoto(req, res, next) {

    eventService.getById(req.params.eventId).then(function (result) {
        var multimediaSize = result.multimedia.length;
        var spliceIndex = -1;
        for (var i = 0; i < result.multimedia.length; i++) {
            if (result.multimedia[i].uploader == req.params.uploaderId && result.multimedia[i].path == "uploads/" + req.params.photoName) {
                spliceIndex = i;
                break;
            }
        }

        if (spliceIndex != -1) {
            result.multimedia.splice(spliceIndex, 1);
        }
        if (multimediaSize != result.multimedia.length) {
            eventService.update(req.params.eventId, { multimedia: result.multimedia })
                .then(function (res) {
                    fs.unlink('uploads/' + req.params.photoName, (err) => {
                        if (err) throw err;
                        console.log('successfully deleted ' + req.params.photoName);
                        res.sendStatus(200);
                    });
                })
                .catch(err => next(err));;
        }
    }).catch(err => next(err));




}

