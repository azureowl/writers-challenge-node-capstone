'use strict';

const mongoose = require('mongoose');

const NotebookSchema = mongoose.Schema({
    title: {type: String, required: true},
    notebook: {type: String, required: true},
    content: String,
    misc: {
        wordCount: Number,
        data: Date
    }
});

NotebookSchema.methods.serialize = function () {
    return {
        id: this._id,
        title: this.title,
        content: this.content,
        misc: this.misc
    };
};

const Notebook = mongoose.model("notebooks", NotebookSchema);

module.exports = {Notebook};