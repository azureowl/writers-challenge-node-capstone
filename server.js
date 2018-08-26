const express = require('express');
const morgan = require('morgan');
const app = express();



const PORT = process.env.PORT || 3000;

app.use(morgan('common'));
app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}.`);
});