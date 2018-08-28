const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const app = express();

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL, TEST_DATABASE_URL} = require('./config');

app.use(morgan('common'));
app.use(express.static('public'));

let server;

function runServer(TEST_DATABASE_URL, PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(TEST_DATABASE_URL, {useNewUrlParser: true}, err => {
        if (err) {
            return reject(`Something went wrong -- MongoError: ${err.errmsg}`);
        }
        server = app.listen(PORT, () => {
            console.log(`Your app is listening on port ${PORT}`);
            resolve('Successfully connected!');
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
    runServer(TEST_DATABASE_URL, PORT).catch(err => console.error(err));
}