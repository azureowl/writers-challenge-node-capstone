'use strict';

const mongoose = require('mongoose');

const PageSchema = mongoose.Schema({
    content: String,
    meta: {
        wordCount: Number
    },
    notebook: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Notebook',
        required: true
    }
});

PageSchema.methods.serialize = function () {
    return {
        content: this.content,
        meta: this.meta
    };
};

const Page = mongoose.model("pages", PageSchema);

module.exports = {
    Page
};