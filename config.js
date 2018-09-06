exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://admin:password1@ds131902.mlab.com:31902/writers-challenge';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://admin:password1@ds133152.mlab.com:33152/writers-challenge-test';
exports.PORT = process.env.PORT || 8080;
exports.OXID = process.env.OXID;
exports.OXKEY = process.env.OXKEY;