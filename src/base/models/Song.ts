const mong = require('mongoose');
const Song = mong.Schema({
    guild: String,
    name: String,
    url: String,
    ID: String,
    author: String
},
{
    strict: true
});
module.exports = mong.model('Song', Song);