const { User } = require('../models/user');
const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const router = express.Router();

// ************ Login User ************
router.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({
            username: username
        })
        .then(user => {
            if (!user) {
                return res.status(401).json('User does not exist.');
            }

            user.validatePassword(password, (err, isValid) => {
                if (err) {
                    return res.status(500).json('Internal Error');
                }
                if (!isValid) {
                    return res.status(401).json('Password Invalid');
                } else {
                    console.log(`User ${username} logged in. at line 27`);
                    return res.json(user.username);
                }
            });
        })
        .catch(err => {
            return runErrorMess(res, "Internal Server Error");
        });

});

// ************ Register User ************
router.post('/register', (req, res) => {
    const name = req.body.name;
    const username = req.body.username;
    const password = req.body.password;

    bcrypt.genSalt(10, function (err, salt) {
        if (err) {
            return res.status(500).json('Internal Error');
        }

        bcrypt.hash(password, salt, function (err, hash) {
            if (err) {
                return res.status(500).json('Internal Error');
            }

            User.create({
                    name: req.body.name,
                    username: req.body.username,
                    password: hash
                })
                .then(user => {
                    console.log(`User ${username} created.`);
                    console.log(user, ' at line 60');
                    return res.json(user.username);
                })
                .catch(err => {
                    if (err.code === 11000) {
                        return runErrorMess(res, "User already exists.");
                    }
                    return runErrorMess(res, "Internal Server Error");
                });
        });
    });
});

// ************ Update User ************
router.put('/profile', (req, res) => {
    const user = req.body.user;
    const updateableFields = ['name', 'password'];
    const toUpdate = {};

    updateableFields.forEach(field => {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });

    User.findOne({
            username: user
        })
        .then(user => {
            if (!user) {
                return res.status(401).json('User does not exist.');
            }

            if ('password' in toUpdate) {
                bcrypt.genSalt(10, function (err, salt) {
                    if (err) {
                        return res.status(500).json('Internal Error');
                    }

                    bcrypt.hash(toUpdate.password, salt, function (err, hash) {
                        if (err) {
                            return res.status(500).json('Internal Error');
                        }
                        toUpdate.password = hash;
                        updateUser(toUpdate);
                    });
                });
            } else {
                updateUser(toUpdate);
            }

            function updateUser(obj) {
                user.set(obj);
                user.save(function (err, updatedUser) {
                    if (err) return handleError(err);
                    res.end();
                });
            }

        })
        .catch(err => {
            return runErrorMess(res, "Internal Server Error");
        });
});

function runErrorMess(res, msg) {
    return res.status(500).json(msg);
}

module.exports = router;
