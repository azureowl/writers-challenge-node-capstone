'use strict';

const mongoose = require('mongoose');

const PageSchema = mongoose.Schema({
    content: String,
    meta: {
        wordCount: Number
    },
    notebook: {
        title: {
            type: String,
            required: true
        },
        id: {
            type: mongoose.Schema.Types.ObjectId, ref: 'Notebook',
            required: true
        }
    }
});

PageSchema.methods.serialize = function () {
    return {
        content: this.content,
        meta: this.meta,
        title: this.notebook.title,
        id: this._id,
        notebook_id: this.notebook.id
    };
};

const Page = mongoose.model("pages", PageSchema);

module.exports = {
    Page
};