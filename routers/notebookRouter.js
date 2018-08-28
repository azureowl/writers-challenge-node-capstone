const express = require('express');
const {
  Notebook
} = require('../models/entry');
const router = express.Router();

router.get('/', (req, res) => {
  Notebook.find()
    .then(notebooks => {
      res.json({
        notebooks: notebooks.map(notebook => notebook.serialize())
      });
    })
    .catch(err => {
      console.log(err);
      return runErrorMess(res);
    });
});

router.post('/', (req, res) => {

  if (!('title' in req.body)) {
    return res.status(400).send({
      message: 'Requires title'
    });
  }

  Notebook.create({
      title: req.body.title,
      content: req.body.content || ''
    })
    .then(notebook => {
      res.status(201).json({
        notebook: notebook.serialize()
      });
    })
    .catch(err => {
      console.log(err);
      return runErrorMess(res);
    });
});

router.put('/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      message: 'Request requires a valid and matching id.'
    });
  }

  const permitted = ['title', 'content'];
  const updated = {
    id: req.params.id
    // meta: {
    //   dateUpdated: Date.now()
    // }
  };

  permitted.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  console.log(updated);

  Notebook.findByIdAndUpdate(req.params.id, {$set: updated})
    .then(notebook => res.status(204).end())
    .catch(err => {
      console.log(err);
      return runErrorMess(res);
    });

    // ask mentor or SO
    Notebook.findByIdAndUpdate(req.params.id, {$set: {'meta.dateUpdated': Date.now()}})
    .then(notebook => res.status(204).end())
    .catch(err => {
      console.log(err);
      return runErrorMess(res);
    });
});

router.delete('/:id', (req, res) => {
  Notebook.findByIdAndRemove(req.params.id)
    .then(notebook => res.status(204).end())
    .catch(err => {
      console.log(err);
      return runErrorMess(res);
    });
});

function runErrorMess (res) {
  return res.status(500).json({
    message: 'Internal server error'
  });
}


module.exports = router;