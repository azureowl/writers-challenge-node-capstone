const express = require('express');
const {Notebook} = require('../models/notebook');
const {User} = require('../models/user');
const {Page} = require('../models/entry');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('hi');
});

router.post('/add', (req, res) => {
  console.log(req.body);

  Notebook.findById(req.body.notebook)
    .then(notebook => {
      Page.create({
        content: req.body.content,
        meta: req.body.meta,
        notebook: notebook._id
      })
      .then(page => {
        console.log(page);
        res.status(201).json({
          pages: page.serialize()
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