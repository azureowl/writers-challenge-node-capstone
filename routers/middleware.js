var jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

module.exports = function verifyToken(req, res, next) {
    let token = req.headers['x-access-token'] || req.headers.authorization;
    if (token.startsWith('Bearer')) {
        token = token.slice(7);
    }

    if (token) {
        jwt.verify(token, JWT_SECRET, function (err, decoded) {
            if (err) {
                return res.status(401).json('User is not authorized');
            } else {
                req.decoded = decoded;
                next();
            }
        });
    }
};