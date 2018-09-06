const express = require('express');
const router = express.Router();
const request = require('request');
const { OXID, OXKEY } = require('../config');

router.get('/:word/book/:id', (req, res) => {
    const word = req.params.word;
    console.log(req.params);
    const parameters = req.params.id === 'dictionary' ? '' : '/synonyms;antonyms';
    const url = `https://od-api.oxforddictionaries.com/api/v1/entries/en/${word}${parameters}`;
    var options = {
        url: url,
        headers: {
            app_id: OXID,
            app_key: OXKEY
        }
    };

    request(options, function (err, response, body) {
        if (!err && response.statusCode === 200) {
            const result = JSON.parse(body);
            console.log(result);
            res.json(result);
        } else {
            console.log(err);
        }
    });
});

module.exports = router;