const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();

const notebookRouter = require('./routers/notebookRouter');
const userRouter = require('./routers/userRouter');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL, TEST_DATABASE_URL} = require('./config');

app.use(morgan('common'));
app.use(express.static('public'));
app.use(express.json());
app.use('/notebooks', notebookRouter);
app.use('/users', userRouter);


let server;

// mongoose.connect(TEST_DATABASE_URL, {useNewUrlParser: true});
// app.listen(PORT, () => {
//   console.log(`Your app is listening on port ${PORT}`);
// })

function runServer(databaseUrl, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, {useNewUrlParser: true}, err => {
        if (err) {
            return reject(`Something went wrong -- MongoError: ${err.errmsg}`);
        }
        server = app.listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve();
        }).on('error', (err) => {
            mongoose.disconnect();
            reject(`Whoops! there was an error: ${err}.`);
        });
    }).catch(err => {
        console.log(`Whoops! there was an error: ${err.name}: ${err.errmsg}.`);
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
    runServer(DATABASE_URL, PORT).catch(err => console.error(err));
}

app.use('*', (req, res) => {
  res.status(404).json({
      message: 'Not Found'
  });
});

exports.app = app;
exports.runServer = runServer;
exports.closeServer = closeServer;