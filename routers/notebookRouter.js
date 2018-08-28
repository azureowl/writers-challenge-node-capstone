const express = require('express');
const {Notebook} = require('../models/entry');
const router = express.Router();

router.get('/', (req, res) => {
    Notebook.find()
      .then(notebooks => {
        res.json({notebooks: notebooks.map(notebook => notebook.serialize())});
      })
      .catch(err => {
        console.log(err);
        res.status(500).json({message: 'Internal server error'});
      });
});

module.exports = router;