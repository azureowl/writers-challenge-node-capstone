const express = require('express');
const {Notebook} = require('../models/notebook');
const {User} = require('../models/user');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('hi');
});

// router.post('/add', (req, res) => {

//   if (!('title' in req.body)) {
//     return res.status(400).send({
//       message: 'Requires title'
//     });
//   }

//   console.log(req.body);
//   const username = req.body.username;

//   User.findOne({username: username})
//     .then(user => {
//         Notebook.create({
//           title: req.body.title,
//           content: req.body.content || '',
//           user: user._id
//         })
//         .then(notebook => {
//           res.status(201).json({
//             notebooks: notebook.serialize()
//           });
//         })
//         .catch(err => {
//           console.log(err);
//           return runErrorMess(res);
//         });
//     })
//     .catch(err => {
//       return runErrorMess(res, "Internal Server Error");
//     });


// });

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