const mongoose = require('mongoose');
const Queue = mongoose.Schema({
    guild: String,
    songs: Array
},
{
    strict: true
});
module.exports = mongoose.model('Queue', Queue);
export default mongoose.model('Queue', Queue);