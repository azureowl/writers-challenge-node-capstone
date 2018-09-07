"use strict";

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        trim: true,
        unique: true,
        required: true
    },
    password: {
        type: String,
        trim: true,
        required: true
    },
    goal: {
        type: Number
    }
});

userSchema.methods.validatePassword = function (password, callback) {
    bcrypt.compare(password, this.password, (err, isValid) => {
        if (err) {
            callback(err);
            return;
        }
        callback(null, isValid);
    });
};

const User = mongoose.model('User', userSchema);

module.exports = {User};