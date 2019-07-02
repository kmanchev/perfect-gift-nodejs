﻿const express = require('express');
/* var multipart = require('connect-multiparty');
var multipartMiddleware = multipart({ uploadDir: './uploads' }); */
const router = express.Router();//.all(multipartMiddleware);
const userService = require('./user.service');
const imageService = require('../_helpers/image.service');
const eventService = require('../events/event.service');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads2');

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
router.get('/events', getEventsForCurrentUser);
router.get('/event/:id', getEvent);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', _deleteUser);
router.post('/createEvent', createEvent);
router.post('/deleteEvent/:id', deleteEvent);
router.put('/updateEvent/:id', updateEvent);
//router.post('/upload', multipartMiddleware, uploadData);
router.post('/photoUpload/:eventId', upload.single('productImage'), photoUpload);

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
    userService.getById(req.user.sub)
        .then(function (result) {
            return result ? res.json(result.events) : res.sendStatus(404);
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
        updatedMultimedia.push(req.file.path);
        eventService.update(req.params.eventId, { multimedia: updatedMultimedia })
            .then(() => res.json({}))
            .catch(err => next(err));;
    }).catch(err => next(err));

    /* var img = fs.readFileSync(req.file.path);
    var encode_image = img.toString('base64');

    var finalImg = {
        contentType: req.file.mimetype,
        image: new Buffer(encode_image, 'base64')
    };
    imageService.saveImageToDb(finalImg); */

}

