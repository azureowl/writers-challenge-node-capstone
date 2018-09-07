require('dotenv').config();

// const config = {
//   db: process.env.DATABASE_URL,
//   testdb: process.env.TEST_DATABASE_URL,
//   port: process.env.PORT,
//   OXID: process.env.OXID,
//   OXKEY: process.env.OXKEY
// };

exports.DATABASE_URL = process.env.DATABASE_URL.toString();
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL.toString();
exports.PORT = process.env.PORT || 8080;
exports.OXID = process.env.OXID;
exports.OXKEY = process.env.OXKEY;