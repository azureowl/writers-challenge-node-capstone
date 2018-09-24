const express = require('express');
const {Notebook} = require('../models/notebook');
const {User} = require('../models/user');
var ObjectId = require('mongodb').ObjectID;
var jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const router = express.Router();

function verifyToken (req, res, next) {
  let token = req.headers['x-access-token'] || req.headers.authorization;
  if (token.startsWith('Bearer')) {
    token = token.slice(7);
  }

  if (token) {
    jwt.verify(token, JWT_SECRET, function(err, decoded) {
      if (err) {
        return res.status(401).json('User is not authorized');
      } else {
        req.decoded = decoded;
        next();
      }
    });
  }
}

router.all('*', verifyToken);

// ************ GET User's notebooks ************
router.get('/:userID/all', (req, res) => {
  Notebook.find({user: ObjectId(req.params.userID)})
    .then(notebooks => {
      let wordCount = 0;
      notebooks.forEach(notebook => {
        const count = notebook.countWords().content;
        wordCount += count;
      });
      res.status(200).json({
        notebooks: notebooks.map(notebook => notebook.serialize()),
        wordCountTotal: wordCount
      });
    })
    .catch(err => {
      console.log(err);
      return runErrorMess(res);
    });
});

// ************ GET specific notebook ************
router.get('/:id', (req, res) => {
  Notebook.findById(req.params.id)
    .then(notebook => {
      res.json(notebook.content);
    })
    .catch(err => {
      console.log(err);
      return runErrorMess(res);
    });
});

// ************ POST notebook ************
router.post('/', (req, res) => {

  if (!('title' in req.body)) {
    return res.status(400).send({
      message: 'Requires title'
    });
  }

  const username = req.body.username;

  User.findOne({username: username})
    .then(user => {
        Notebook.create({
          title: req.body.title,
          content: req.body.content || '',
          user: user._id
        })
        .then(notebook => {
          res.status(201).json({
            notebooks: notebook.serialize()
          });
        })
        .catch(err => {
          console.log(err);
          return runErrorMess(res);
        });
    })
    .catch(err => {
      return runErrorMess(res, "Internal Server Error");
    });


});

// ************ PUT Notebook title or content ************
router.put('/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      message: 'Request requires a valid and matching id.'
    });
  }

  const updatable = ['title', 'content'];
  const updated = {
    id: req.params.id
  };

  updatable.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Notebook.findByIdAndUpdate(req.params.id, {$set: updated})
    .then(notebook => {
      res.status(201).json(updated);
    })
    .catch(err => {
      console.log(err);
      return runErrorMess(res);
    });
});

// ************ DELETE notebook ************
router.delete('/:id', (req, res) => {
  Notebook.findByIdAndRemove(req.params.id)
    .then(notebook => res.status(204).end())
    .catch(err => {
      console.log(err);
      return runErrorMess(res);
    });
});

function runErrorMess(res, msg) {
  return res.status(500).json(msg);
}


module.exports = router;