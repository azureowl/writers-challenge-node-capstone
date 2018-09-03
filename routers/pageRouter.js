const express = require('express');
const {Notebook} = require('../models/notebook');
const {User} = require('../models/user');
const {Page} = require('../models/entry');
var ObjectId = require('mongodb').ObjectID;
const router = express.Router();

router.get('/:notebookID', (req, res) => {
  console.log(req.params.notebookID);
  Page.find({'notebook.id': ObjectId(req.params.notebookID)})
    .then(pages => {
      res.json({
        pages: pages.map(page => page.serialize())
      });
    })
    .catch(err => {
      console.log(err);
      return runErrorMess(res);
    });
});

router.post('/add', (req, res) => {
  Notebook.findById(req.body.notebook.id)
    .then(notebook => {
      console.log(notebook);
      Page.create({
        content: req.body.content,
        meta: req.body.meta,
        notebook: {
          title: req.body.notebook.title,
          id: notebook._id
        }
      })
      .then(page => {
        res.status(201).json(page.serialize());
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


// router.put('/:id', (req, res) => {
//   if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
//     res.status(400).json({
//       message: 'Request requires a valid and matching id.'
//     });
//   }

//   const permitted = ['title', 'content'];
//   const updated = {
//     id: req.params.id
//     // meta: {
//     //   dateUpdated: Date.now()
//     // }
//   };

//   permitted.forEach(field => {
//     if (field in req.body) {
//       updated[field] = req.body[field];
//     }
//   });

//   Notebook.findByIdAndUpdate(req.params.id, {$set: updated})
//     .then(notebook => {
//       res.status(200).json(updated);
//     })
//     .catch(err => {
//       console.log(err);
//       return runErrorMess(res);
//     });

//     // ask mentor or SO
//     Notebook.findByIdAndUpdate(req.params.id, {$set: {'meta.dateUpdated': Date.now()}})
//     .then(notebook => res.status(204).end())
//     .catch(err => {
//       console.log(err);
//       return runErrorMess(res);
//     });
// });

// router.delete('/:id', (req, res) => {
//   Notebook.findByIdAndRemove(req.params.id)
//     .then(notebook => res.status(204).end())
//     .catch(err => {
//       console.log(err);
//       return runErrorMess(res);
//     });
// });

function runErrorMess(res, msg) {
  return res.status(500).json(msg);
}


module.exports = router;