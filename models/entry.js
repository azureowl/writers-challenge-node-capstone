'use strict';

const mongoose = require('mongoose');
const {User} = require('./user');

const NotebookSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: String,
    meta: {
        wordCount: Number,
        dateCreated: {
            type: Date,
            default: Date.now
        },
        dateUpdated: {
            type: Date
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
        required: true
    }
});

NotebookSchema.methods.serialize = function () {
    return {
        id: this._id,
        title: this.title,
        content: this.content,
        meta: this.meta
    };
};

const Notebook = mongoose.model("notebooks", NotebookSchema);

module.exports = {
    Notebook
};