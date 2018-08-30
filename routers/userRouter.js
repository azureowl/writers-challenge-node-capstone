const {User} = require('../models/user');
const express = require('express');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const router = express.Router();

router.post('/register', (req, res) => {
    const name = req.body.name;
    const username = req.body.username;
    const password = req.body.password;

    bcrypt.genSalt(10, function(err, salt) {
        if (err) {
            return runErrorMess();
        }

        bcrypt.hash(password, salt, function(err, hash) {
            if (err) {
                return runErrorMess();
            }

            User.create({
                name: req.body.name,
                username: req.body.username,
                password: hash
            })
              .then(user => {
                  console.log(`User \`${username}\` created.`);
                  console.log(user);
                  return res.json(user);
              })
              .catch(err => {
                return runErrorMess(res, err.message);
              });
        });
    });
});



function runErrorMess(res, msg) {
    return res.status(500).json({
        message: msg
    });
}

module.exports = router;

